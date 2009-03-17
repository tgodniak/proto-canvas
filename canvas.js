var Canvas = Class.create({
	initialize: function(element, options) {
	    this.element = $(element);
	    this.params  = options || {};
	    Object.extend(this, options);

	    this.IE = navigator.appName == 'Microsoft Internet Explorer'
	    this.height      = this.element.getHeight();
	    this.width       = this.element.getWidth();
	    this.radius      = this.params.radius * 2  || 20;

	    this.reflection = {};
	    this.reflection.active = this.params.addReflect    || false;
	    this.reflection.height = this.params.reflectHeight || 25;
	    this.reflection.width  = this.width;
	    this.reflection.space  = this.params.reflectSpace  || 2;

	    this.border = {}
	    this.border.active = this.params.border      || false;
	    this.border.width  = this.params.borderWidth || 1;
	    this.border.color  = this.params.borderColor || '#FFFFFF';
	    this.offset = 0;

	    this.init();
	}
    });

Canvas.fn = Canvas.prototype;

Canvas.fn.init = function() {
    if (this.IE) {
	this.vmlRoundedRect();
	this.vmlReflect();
    } else {
	this.canvas = new Element('canvas', {'id':this.element.id});
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
    if (this.reflection.active) { this.reflect(); }
    this.element.replace(this.canvas);
};

Canvas.fn.reflect = function() {
    var div = new Element('div', {'id': this.element.id + '_wrapper', 'style':'width:' + this.reflection.width + 'px;'});
    var canvas = new Element('canvas', {'id': this.element.id + '_reflection'});
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
    vmlShape += '</v:roundrect>';
    vml.update(vmlShape);
    this.element.parentNode.appendChild(vml);
    this.element.hide();
};

Canvas.fn.vmlReflect = function() {
    var div = new Element('div', {'id': this.element.id + '_wrapper', 'style':'width:' + this.reflection.width + 'px;'});
    var reflection = new Element('img', {'src':this.element.src});
    reflection.setStyle('display:block;width:' + this.reflection.width + 'px');
    reflection.setStyle('margin-bottom:-' + (this.height-this.reflection.height) + 'px');

    reflection.style.filter = 'flipv progid:DXImageTransform.Microsoft.Alpha(opacity=60, style=1, finishOpacity=0, startx=0, starty=0, finishx=0, finishy=5)';

    this.element.parentNode.appendChild(div);
    div.insert(this.element);
    div.insert(reflection);
};