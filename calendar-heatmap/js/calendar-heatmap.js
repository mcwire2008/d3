/** loading json data object **/
var dataList = [];
function generateData(year) {
	var days = [], months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
	for (var a=1; a<30;a++) { var a2 = (a < 10 ? "0"+a : a); days.push(a2);}
	
	for(var i=0; i< 12; i++) {
		for(var j=1; j<=12; j++){
			var mR = Math.round(Math.random(12) * j);
			if(mR <= 0) continue;
			dataList.push({
				Id: 125 + j,
				Date: year.toString()
					.concat("-")
					.concat(months[Math.floor(Math.random() * months.length)])
					.concat("-")
					.concat(days[Math.floor(Math.random() * days.length)]),
				Open: 125 * mR * Math.random(4),
				Low: 125 * mR * Math.random(4),
				Close: 125 * mR * Math.random(4*j),
				High: 700 * months[Math.floor(Math.random() * months.length)]
			})
		}
	}
	console.log(JSON.stringify(dataList, {}, true));
}

generateData(2018);

//////////////////////////////////////////// end of data ////////////////////////////

function heatCalendar(width) {
	
	const widthCellRadio = 53; // 56.5 ratio between the width of svg and cells
	var width = width || 1700,
	    height = 275,
	    monthHeader = 30,
	    cellSize = width/widthCellRadio,
	    actuallCellSize = cellSize-8;
	
	console.log("width: " + width)
	var now = new Date();
	var month_labels = d3.timeMonths(new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 11, 31)); // use for month labels
	var timeFormat = "%Y-%m-%d";
	var formatPercent = d3.format(".1%");
	var timeFormatFn = d3.timeParse(timeFormat);
	var monthName = d3.timeFormat("%B");
	var max_value = d3.max(dataList, function (d) { return d.High; })
	var inTransition = false;
	var color = d3.scaleLinear()
		.range(['#ffffff', '#cd2327'])
		.domain([0, max_value]);
	var cellItemSize = function(recId) {
		if(recId && recId != null) {
			var cellVal =  actuallCellSize * 0.75 + (actuallCellSize * filterByID(recId)[0].High / max_value) * 0.25;
			return cellVal;
		}
		return actuallCellSize;
	}
	
	/*****************************************************************
		Start of SVG element
	 ****************************************************************/
	
	var svg = d3.select("body")
	  .selectAll("svg")
	  .data(d3.range(now.getFullYear(), now.getFullYear()+1))
	  .enter().append("svg")
	  .attr("width", width)
	  .attr("height", height)
	  .append("g")
	  .attr("transform", "translate(0," + (monthHeader) + ")");
	
	//*****************************************************************
	// Month label text
	//*****************************************************************
	svg.selectAll('.label-month').remove();
	var monthLabelGrp = svg.selectAll('.label-month')
		.data(month_labels)
		.enter()
		.append('g')
		.attr('class', 'label-month');
	
	// the month text label
	monthLabelGrp.append("text")
		.text(function (d) {
			return d.toLocaleDateString('en-us', {month: 'short'});
		})
		.attr('x', function (d, i) {
			var m3 = d3.timeWeek.count(d3.timeYear(d), d) * cellSize+4;
			return m3 + cellSize * 2 + cellSize/2;
		})
		.attr('y', -(monthHeader/2));
	
	//the month round border
	monthLabelGrp.append('rect')
		.attr("width", 60)
		.attr("height", 20)
		.attr("fill", "transparent")
		.attr("stroke", "#ddd")
		.attr("ry", 10)
		.attr('x', function (d, i) {
			var m3 = d3.timeWeek.count(d3.timeYear(d), d) * cellSize+4;
			return (m3 + cellSize * 2 + cellSize/2) - (60/3);
		})
		.attr('y', -(monthHeader))
		.on('mouseenter', function (d) {
			d3.select(this).attr("oldStroke", d3.select(this).attr("stroke"))
				.attr("stroke", "#000");
	        svg.select('path[month="'.concat(d.getMonth()).concat('"]'))
	          .transition()
	          .duration(400)
	          .ease(d3.easeCircle)
	          .attr("stroke-dasharray", null)
	          .attr("opacity", "1");
	      })
		.on('mouseout', function (d) {
			d3.select(this).attr("stroke", d3.select(this).attr("oldStroke"));
	        svg.select('path[month="'.concat(d.getMonth()).concat('"]'))
	          .transition()
	          .duration(400)
	          .ease(d3.easeCircle)
	          .attr("stroke-dasharray", "1,5")
	          .attr("opacity", ".4")
	      })
		
	//*****************************************************************
	// Calendar event cell initializing
	//*****************************************************************
	
	svg.selectAll(".item-circle").remove();
	var rect = svg.append("g")
		.attr("fill", "none")
		.attr("stroke", "#ddd")
		.selectAll("rect")
		.data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		.enter()
		.append("rect")
		.attr("class", "item-circle")
		.attr("opacity", 0)
		.attr("width", actuallCellSize)
		.attr("height", actuallCellSize)
		.attr('rx', cellSize)
		.attr('ry', cellSize)
		.attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize+4; })
		.attr("y", function(d) { return d.getDay() * cellSize +4; })
		.datum(d3.timeFormat(timeFormat))
		.on('mouseover', function(d) {
			var circle = d3.select(this), recId = circle.attr("id");
			if(!recId) return;
			inTransition = true;
		    circle.transition()
	            .duration(400)
	            .ease(d3.easeCircle)
	            .attr("oldWidth", circle.attr("width"))
	            .attr("width", function(d) { return parseInt(circle.attr("width")) + 6; })
				.attr("oldHeight", circle.attr("height"))
	            .attr("height", function(d) { return parseInt(circle.attr("height")) + 6;})
				.attr("oldX", function(e) { return circle.attr("x"); })
				.attr("x", function(d) { 
					var date=timeFormatFn(d);
					var oldX = parseInt(circle.attr("x"));
					var newW = parseInt(circle.attr("width"));
					var ratio = (actuallCellSize - newW);
					return oldX - ratio*.5;
				})
				.attr("oldY", function(e) { return circle.attr("y"); })
				.attr("y", function(d) {
					var date=timeFormatFn(d);
					var oldX = parseInt(circle.attr("y"));
					var newW = parseInt(circle.attr("width"));
					var ratio = (actuallCellSize - newW);
					return oldX - ratio*.5;
				})
			// data printing
			var recData = filterByID(recId)[0];
		    console.log("Here the value:: Open = " + JSON.stringify(recData))
		})
		.on('mouseout', function(d) {
			var circle = d3.select(this), recId = circle.attr("id");
			if(!recId) return;
			circle.transition()
		        .duration(400)
		        .ease(d3.easeCircle)
				.attr("width", circle.attr("oldWidth"))
				.attr("height", circle.attr("oldHeight"))
				.attr("x", function(d) { return circle.attr("oldX"); })
				.attr("y", function(d) { return circle.attr("oldY"); });
		});
	
	rect.transition()
		.delay( function () {   return (Math.cos(Math.PI * Math.random()) + 1) * 500; })
		.duration(440)
		.ease(d3.easeCircle)
		.attr('opacity', 1);
	
	//*****************************************************************
	// End of calendar event cell initializing
	//***************************************************************** 
	
	// Month box border line
	var path = svg.append("g")
		.attr("fill", "none")
		.attr("stroke", "#000")
	path.selectAll("path").remove();
	path.selectAll("path")
	    .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
	    .enter()
	    .append("path")
	    .attr("month", function(t0) { return t0.getMonth(); })
	    .attr("stroke-dasharray", "1,5")
		.attr("opacity", ".4")
	    .attr("d", function(t0) {
		  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
		      d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
		      d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
		  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
		      + "H" + w0 * cellSize + "V" + 7 * cellSize
		      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
		      + "H" + (w1 + 1) * cellSize + "V" + 0
		      + "H" + (w0 + 1) * cellSize + "Z";
		});
	
	
	function filterByID(id) {
		return dataList.filter(function(item) {
			return item.Id == id;
		})
	}
	
	/** ***** Load data ****** */
	
	var data = d3.nest()
		.key(function(d) { return d.Date; })
		.rollup(function(d) { return d[0].High; })
		.object(dataList);
	
	rect.filter(function(d) { return d in data; })
		.attr("id", function(d, i) { return dataList[i]['Id']; })
		.attr("width", function(d, i){ return cellItemSize(dataList[i]['Id']); })
		.attr("height", function(d, i){ return cellItemSize(dataList[i]['Id']); })
		.attr("x", function(d) { 
			var date=timeFormatFn(d);
			var oldX = parseInt(d3.select(this).attr("x"));
			var newW = parseInt(d3.select(this).attr("width"));
			var ratio = (actuallCellSize - newW);
			return oldX + ratio*.5;
		})
		.attr("y", function(d) { 
			var date=timeFormatFn(d); 
			var oldY = parseInt(d3.select(this).attr("y"));
			var newW = parseInt(d3.select(this).attr("width"));
			var ratio = (actuallCellSize - newW);
			return oldY + ratio*.5;
		})	
		.attr("fill", function(d, i) { var high = parseInt(dataList[i]['High']); return color(high); })
		.append("title")
		.text(function(d) { return d + ": " + formatPercent(data[d]); });
	
	return {
		restart: function () {
			console.log('restarting.....')
			d3.select("svg").remove();
		}
	}
}

window.onresize=function() {
	console.log("resizing with width : " + window.innerWidth);
	heatCalendar().restart();
	heatCalendar(window.innerWidth-20);
}
window.onload=function() {
	heatCalendar(window.innerWidth-20);
}