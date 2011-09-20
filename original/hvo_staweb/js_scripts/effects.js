function myclick(i) {
	coldmarkers[i].openInfoWindowHtml(htmls[i]);
}


// Change specified marker from cold to hot (for mouse over)
// It deletes the cold Icon marker and replaces it with the hot Icon marker      
function mymouseover(i) {
	hotmarker.setPoint(coldmarkers[i].getPoint());
	hotmarker.importance=1000000;
	map.addOverlay(hotmarker);
}

function importanceOrder (marker,b) {
	return GOverlay.getZIndex(marker.getPoint().lat()) + marker.importance*10000;
}


// Change specified marker from hot to cold (for mouse out)
// It deletes the hot Icon marker and replaces it with the cold Icon marker      
function mymouseout(i) {
	map.removeOverlay(hotmarker);
}