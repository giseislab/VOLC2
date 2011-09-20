// Create polygon method for collision detection
GPolygon.prototype.containsLatLng = function(latLng) {
	// Do simple calculation so we don't do more CPU-intensive calcs for obvious misses
	var bounds = this.getBounds();
	
	if(bounds != null && !bounds.containsLatLng(latLng)) {
		return false;
	}
	
	// Point in polygon algorithm found at http://msdn.microsoft.com/en-us/library/cc451895.aspx
	var numPoints = this.getVertexCount();
	var inPoly = false;
	var i;
	var j = numPoints-1;
	
	for(var i=0; i < numPoints; i++) { 
		var vertex1 = this.getVertex(i);
		var vertex2 = this.getVertex(j);
		
		if (vertex1.lng() < latLng.lng() && vertex2.lng() >= latLng.lng() || vertex2.lng() < latLng.lng() && vertex1.lng() >= latLng.lng())  {
			if (vertex1.lat() + (latLng.lng() - vertex1.lng()) / (vertex2.lng() - vertex1.lng()) * (vertex2.lat() - vertex1.lat()) < latLng.lat()) {
				inPoly = !inPoly;
			}
		}
		
		j = i;
	}
	
	return inPoly;
};