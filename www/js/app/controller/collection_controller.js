CollectionController = {
  displayList: function (collectionData) {
    var content = App.Template.process("collection_list", collectionData);
    var $updateNode = $("#collection-list");
    $updateNode.html(content);
    $updateNode.listview("refresh");
  },

  displayName: function (collectionName) {
    var content = App.Template.process("collection_name", collectionName);
    $('.title').html(content);
    CollectionController.adjustTitle($('#title-site-list')[0]);
  },

  adjustTitle: function($element){
    if(Translation.getLang() == 'kh' && $element.offsetWidth < 140){
      $element.style.marginLeft = "calc(5% + 113px)";
    }
  },

  renderList: function () {
    App.isOnline() ? CollectionController.getByUserIdOnline() : CollectionController.getByUserIdOffline();
  },

  getByUserIdOffline: function () {
    CollectionOffline.fetchByUser(function (collections) {
      CollectionController.renderCollectionListByUser(collections)
    });
  },

  getByUserIdOnline: function () {
    CollectionModel.fetch(function (collections) {
      CollectionController.renderCollectionListByUser(collections);
      CollectionController.synCollectionByUser(collections);
    });
  },

  renderCollectionListByUser: function(collections) {
    var collectionIds = [];
    for(var j = 0 ; j<collections.length;j++){
      collectionIds.push(CollectionController.collectionId(collections[j]))
    }

    var userId = UserSession.getUser().id;
    var options = {userId: userId, collectionIds: collectionIds};

    SiteOffline.countSiteOfflineByUserCollections(options, function(result){
      var collectionDatas = [];
      var totalSiteOfflines = 0 ;

      for(var i=0; i<collections.length; i++){
        var collection = collections[i]
        var collectionId = CollectionController.collectionId(collection)
        var countSiteOffline = result[collectionId] || '';
        var collectionData = CollectionController.prepareCollection(collection, userId, countSiteOffline);
        collectionDatas.push(collectionData);

        if(countSiteOffline)
          totalSiteOfflines = totalSiteOfflines + parseInt(countSiteOffline) ;

      }

      CollectionController.displayList({collectionList: collectionDatas});
      SiteHelper.toggleBtnViewAllOfflineSite(totalSiteOfflines);
    });
  },

  collectionId: function(collection) {
    return collection.idcollection || collection.id
  },

  synCollectionByUser: function (newCollections) {
    CollectionOffline.destroyAllByUser(function(){
      CollectionOffline.add(newCollections);
    })
  },

  prepareCollection: function (collection, userId, count) {
    var item = {
      name: collection.name,
      description: collection.description,
      user_id: userId
    };
    item.idcollection = CollectionController.collectionId(collection);
    item.displayCount = (count == 0) ?  "" : count;
    return item;
  }
};
