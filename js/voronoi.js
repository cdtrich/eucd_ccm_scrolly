// voronoi cells for better hover
// var cell = g
// 	.append("g")
// 	.attr("class", "cells")
// 	.selectAll("g")
// 	.data(
// 		d3
// 			.voronoi()
// 			.extent([
// 				[-margin.left, -margin.top],
// 				[width + margin.right, height + margin.top]
// 			])
// 			.x(function (d) {
// 				return d.x;
// 			})
// 			.y(function (d) {
// 				return d.y;
// 			})
// 			.polygons(data)
// 	)
// 	.enter()
// 	.append("g");

// bouncy dots from here https://bl.ocks.org/maegul/7d8e7342c649fdc077a6984e52da4b62
// function tick() {
// 	selectAll(".dots")
// 		.attr("cx", (d) => d.x)
// 		.attr("cy", (d) => d.y);
// };
// group for voronoi cells
// var g = svg
// 	.append("g")
// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
