var Canvas = Class.create({
	initialize: function(element, options) {
	    this.element = $(element);
	    this.id      = (element.id == null || element.id == '') ? this.generateRandomId() : element.id;
	    this.params  = options    || {};
	    Object.extend(this, options);

	    this.IE = navigator.appName == 'Microsoft Internet Explorer'
	    this.height      = this.element.getHeight();
	    this.width       = this.element.getWidth();

	    this.roundCorner = this.params.round    || true
	    this.radius      = this.params.radius*2 || 16;

	    this.reflection        = {};
	    this.reflection.active = this.params.reflect       || false;
	    this.reflection.height = this.params.reflectHeight || 20;
	    this.reflection.width  = this.width;
	    this.reflection.space  = this.params.reflectSpace  || 0;

	    this.border        = {}
	    this.border.active = this.params.border      || false;
	    this.border.width  = this.params.borderWidth || 1;
	    this.border.color  = this.params.borderColor || '#FFFFFF';
	    this.offset        = 0;

	    this.init();
	}
    });

Canvas.fn = Canvas.prototype;

Canvas.fn.generateRandomId = function() {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var stringLength = 10;
    var randomString = '';
    for (var i = 0; i < stringLength; i++) {
	var rnum = Math.floor(Math.random() * chars.length);
	randomString += chars.substring(rnum, rnum + 1);
    }
    return randomString;
};

Canvas.fn.init = function() {
    if (this.IE) {
	if(this.roundCorner) { this.vmlRoundedRect(); }
	if(this.reflection.active) { this.vmlReflect(); }
    } else {
	this.canvas = new Element('canvas', {'id':this.id});
	this.ctx           = this.canvas.getContext('2d');
	this.canvas.height = this.height;
	this.canvas.width  = this.width;
	this.roundedRect();
    }
};

Canvas.fn.roundedRect = function(){
    var x = 0;
    var y = 0;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y+this.radius);
    this.ctx.lineTo(x, y+this.height-this.radius);
    this.ctx.quadraticCurveTo(x, y+this.height,x+this.radius,y+this.height);
    this.ctx.lineTo(x+this.width-this.radius, y+this.height);
    this.ctx.quadraticCurveTo(x+this.width, y+this.height, x+this.width, y+this.height-this.radius);
    this.ctx.lineTo(x+this.width, y+this.radius);
    this.ctx.quadraticCurveTo(x+this.width, y, x+this.width-this.radius, y);
    this.ctx.lineTo(x+this.radius, y);
    this.ctx.quadraticCurveTo(x, y, x, y+this.radius);
    if(this.border.active) {
        this.ctx.strokeStyle = this.border.color;
	this.ctx.lineWidth   = this.border.width * 2;
        this.ctx.stroke();
	this.offset = this.border.width;
    }
    this.ctx.clip();
    this.ctx.drawImage(this.element, x + this.offset, y + this.offset, this.width - this.offset*2, this.height - this.offset*2);
    if (this.reflection.active) { this.canvasReflect(); }
    this.element.replace(this.canvas);
};

Canvas.fn.canvasReflect = function() {
    var div = new Element('div', {'id': this.id + '_wrapper', 'style':'width:' + this.reflection.width + 'px;'});
    var canvas = new Element('canvas', {'id': this.id + '_reflection'});
    var ctx = canvas.getContext("2d");

    canvas.height = this.reflection.height;
    canvas.width  = this.reflection.width;
    
    this.element.parentNode.insert(div);
    div.insert(this.element);    
    div.insert(canvas);

    ctx.save();
    ctx.translate(0, this.height);
    ctx.scale(1,-1);
    ctx.drawImage(this.canvas, 0, -this.reflection.space, this.width, this.height);
    ctx.restore();
    ctx.globalCompositeOperation = "destination-out";

    var gradient = ctx.createLinearGradient(0, 0, 0, this.reflection.height);
    gradient.addColorStop(0.0, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.7)");
    gradient.addColorStop(1.0, "rgba(255, 255, 255, 0.9)");

    ctx.fillStyle = gradient;
    ctx.rect(0, 0, this.reflection.width, this.reflection.height);
    ctx.fill();
};

Canvas.fn.vmlRoundedRect = function() {
    var vml = new Element('');
    var vmlParams = $H({stroked:(this.border.active ? "t" : "f"),
			strokeweight:(this.border.width + "px;"),
			strokecolor:this.border.color,
			arcsize:((this.radius)/(this.height)*50) +'%',
			style: "zoom:1;width:" + this.width + "px;height:" + this.height + "px;"});

    var vmlShape = '<v:roundrect ';
    vmlParams.each(function(pair){
	    vmlShape += pair.key + '="' + pair.value + '" ';
	});
    vmlShape += '>';
    vmlShape += '<v:fill src="' + this.element.src + '" type="frame" />'
    vml.update(vmlShape);
    this.element.parentNode.appendChild(vml);
    this.element.hide();
};

Canvas.fn.vmlReflect = function() {
    var div = new Element('div', {'id': this.id + '_wrapper', 'style':'width:' + this.reflection.width + 'px;'});
    var reflection = new Element('div');
    var backgroundOffset = this.element.height-this.reflection.height;
    reflection.setStyle('background:url('+ this.element.src + ') no-repeat 0 -' + backgroundOffset + 'px');
    reflection.setStyle('width:' + this.reflection.width-(this.border.width*2) + 'px');
    reflection.setStyle('margin-left:' + this.border.width + 'px');
    reflection.setStyle('height:' + this.reflection.height + 'px');
    reflection.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(grayscale=0, xray=0, mirror=1, invert=0, opacity=1, rotation=2) progid:DXImageTransform.Microsoft.Alpha(Opacity=60, FinishOpacity=0, Style=1, StartX=0, FinishX=0, StartY=0, FinishY=100)';
    this.element.parentNode.appendChild(div);
    div.insert(this.element);
    div.insert(reflection);
};