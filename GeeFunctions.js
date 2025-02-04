exports.bufferzone_intactness = function(intactness_layer,study_area_shp,study_area,zoom_level){
  Map.centerObject(study_area_shp,zoom_level)
  Map.addLayer(study_area_shp,{},study_area)
  var intactness_vis = {min: 0,max: 1.0,
    palette: ['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'],
  };
  var bufferDistance = 5000;
  print(study_area_shp)
  var study_area_shpBuffer = study_area_shp.geometry().buffer(bufferDistance);
  var bufferOutsidestudy_area_shp = study_area_shpBuffer.difference(study_area_shp);
  Map.addLayer(bufferOutsidestudy_area_shp,{},"bufferOutsidestudy_area_shp")
  
  var diversityImage = intactness_layer.clip(bufferOutsidestudy_area_shp);
  Map.addLayer(diversityImage,intactness_vis,"diversityImage")
  var lossImage_1 = gfc2014.select(['loss']).clip(bufferOutsidestudy_area_shp);
  
  var lossImageResampled = lossImage_1.resample('bilinear')  
    .reproject({crs: lossImage_1.projection(),scale: 500});
    
  var maskedDiversity = diversityImage.updateMask(lossImageResampled);
  var sampledPoints = maskedDiversity.addBands(lossImageResampled).sample({
    region: study_area_shpBuffer,scale:500,geometries: true});
  // Export the data if needed
  Export.table.toDrive({
    collection: sampledPoints,
    description: study_area +'_Diversity_with_TreeLoss',
    fileFormat: 'CSV'
  });
  print(sampledPoints)
  Map.addLayer(sampledPoints, {color: 'red'}, 'sampled Points');
  Map.addLayer(lossImageResampled.updateMask(lossImageResampled)
  .clip(bufferOutsidestudy_area_shp),{palette: 'FF00FF'}, 'TreeLoss');
}
