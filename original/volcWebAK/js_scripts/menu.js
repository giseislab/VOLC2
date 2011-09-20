Event.observe(window, 'load', function(){
	var li = $$("#toolBar > li");
	var ul = $$("#toolBar li ul");
	
	li.each(function(s){
		if(s.down('ul')){
			s.observe('mouseover', dropMenu.showPopup);
			s.observe('click', dropMenu.showPopup);
			s.observe('mouseout', dropMenu.hidePopup );
		}
	});
	ul.each(function(s){
		s.observe('mouseover', dropMenu.showPopup);
		s.observe('mouseout', dropMenu.hidePopup );
		s.observe('click', dropMenu.hidePopup );
	});
});

var dropMenu = {
    timeout : null,
    showPopup : function(){
		var id;
		this.nodeName=="UL"? id=this: id=this.down('ul');
        clearTimeout(this.timeout);
        if(id.style.display == 'none'){
            this.timeout=setTimeout(function(){new Effect.BlindDown(id, {duration:1, fps:40})},400);
        }
    },
    hidePopup : function(){
		var id;
		this.up().id!="toolBar"? id=this: id=this.down();
        if(id.style.display == 'none'){
            clearTimeout(this.timeout);
        }else{
            this.timeout=setTimeout(function(){new Effect.BlindUp(id, {duration:0.5, fps:40})},200);
        }
    }    
};