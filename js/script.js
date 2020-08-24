console.clear();

///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// use this file as data file
// tooltip
// voronoi hover
// transitions: https://github.com/veltman/flubber
// steps
// ripoff: https://www.bloomberg.com/graphics/2015-auto-sales/
// dropdown: ("add buttons") https://blocks.roadtolarissa.com/1wheel/46874895034f5bded13c97097bf25a83

///////////////////////////////////////////////////////////////////////////
//////////////////////////// libs /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
import {
	select,
	extent,
	scaleLinear,
	scaleBand,
	// timeFormat,
	axisBottom,
	format,
	forceSimulation,
	forceX,
	forceY,
	forceCollide
} from "d3";

// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

// import _ from "lodash";
import { split, forEach, chain, trim } from "lodash";

const url =
	// "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_852u619EmtHZE3p4sq7ZXwfrtxhOc1IlldXIu7z43OFVTtVZ1A577RbfgZEnzVhM_X0rnkGzxytz/pub?gid=0&single=true&output=csv";
	"data/EUISS Database.csv";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// globals //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const colorsCat = [
	"#113655",
	"#f28c00",
	"#3f8ca5",
	"#fab85f",
	"#99d4e3",
	"#fed061"
];

const colorsSeq = [
	"#113655",
	"#245b78",
	"#3f8ca5",
	"#68c4d8",
	"#99d4e3",
	"#c0e3ed",
	"#e1f1f7",
	"#fed061",
	"#fab85f",
	"#f28c00"
];

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Set up svg ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// group for voronoi cells
// var g = svg
// 	.append("g")
// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// const t = d3.transition().duration(1500);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var data = csv(url, (d) => {
	return {
		id: d.CPI_CODE,
		name: d.Name,
		// start: new Date(+d.Start_year, +d.Start_month - 1, +d.Start_day),
		startYear: +d.Start_year,
		// startFix: new Date(
		// 	+d.Start_year,
		// 	+d.Start_month - 1,
		// 	replace(d.Start_day, "unknown", 1)
		// ),
		startLabel: d.Start_day + "-" + d.Start_month + "-" + d.Start_year,
		// end: new Date(+d.End_year, +d.End_month, +d.end_day),
		endYear: +d.End_year,
		// endFix: new Date(
		// 	+d.End_year,
		// 	+d.End_month - 1,
		// 	replace(d.End_day, "unknown", 1)
		// ),
		endLabel: d.end_day + "-" + d.End_month + "-" + d.End_year,
		// report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
		attacker_jurisdiction: d.Attacker_jurisdiction,
		target_jurisdiction: d.Target_jurisdiction,
		victim_jurisdiction: d.Victim_jurisdiction,
		us_me: d.US_military_effects,
		military: d.Ongoing_military_confrontation,
		// command: d.attacker_Existence_of_cyber_command.trim(),
		sector_i: d.CI_Sector.trim(),
		sector_ii: d.CI_Sector.trim(),
		sector_iii: d.CI_Sector.trim(),
		dyad_from: split(d.Dyad, "-")[0],
		dyad_to: split(d.Dyad, "-")[1]
	};
}).then(function (d) {
	// stuxnet fix
	var data = forEach(d, function (value) {
		value.startYear = value.name === "Stuxnet" ? 2010 : value.startYear;
	});

	// dropdown prep

	var valueMap = {};

	//// unique values
	const dataAttacker = chain(data)
		.map((d) => d.attacker_jurisdiction)
		.uniq()
		.value();

	data.forEach(function (d) {
		var attacker = d.attacker_jurisdiction;
		valueMap[attacker] = [];

		dataAttacker.forEach(function (field) {
			valueMap[attacker].push(+d[field]);
		});
	});

	console.log(data);
	chart(data);
});

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data table ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// dropping missing dates (defaults to 1899 otherwise)
// data = filter(data, (d) => {
// 	return d.end_year > 2000;
// });

// new time formats for tooltip
// var formatDate = timeFormat("%d %b %Y");

///////////////////////////////////////////////////////////////////////////
//////////////////////////// scales ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//////////////////////////// plot /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

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

var chart = function (data) {
	// globals

	const width = 1200;
	const height = 300;
	const radius = 15;
	const margin = { top: 20, right: 20, bottom: 20, left: 120 };
	// const svg = d3.create("svg")
	// .attr("viewBox", [0, 0, width, height]);
	const svg = select("#chart") // id app
		.append("svg")
		// .attr("width", width)
		// .attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.style("overflow", "visible");

	//// unique values
	const dataAttacker = chain(data)
		.map((d) => d.attacker_jurisdiction)
		.uniq()
		.value();

	// scales
	const xScale = scaleLinear()
		.domain(
			extent(data, (d) => {
				return d.startYear;
			})
		)
		.range([margin.left, width - margin.right]);

	const yScale = scaleBand()
		.domain(dataAttacker)
		.range([height - margin.bottom, margin.top]);

	var simulation = forceSimulation(data)
		.force(
			"x",
			forceX(function (d) {
				return xScale(d.startYear);
			}).strength(0.99)
		)
		.force("y", forceY(height / 2).strength(0.05))
		.force("collide", forceCollide(radius))
		.stop();

	for (var i = 0; i < data.length * 2; ++i) simulation.tick();

	// updating data
	var update = function (data) {
		var dots = svg.selectAll(".dots").data(data);

		dots
			.enter()
			.append("circle")
			.attr("class", "dots")
			.attr("r", radius)
			.attr("cx", (d) => d.x)
			.attr("cy", (d) => d.y)
			// tooltip
			.on("mouseover", (d, i) => {
				const mouseX = event.pageX;
				const mouseY = event.pageY;
				select(".tooltip")
					.style("left", mouseX + "px")
					.style("top", mouseY - 28 + "px")
					.style("opacity", 0)
					.transition()
					.duration(100)
					.style("visibility", "visible")
					.style("opacity", 1)
					.style("left", mouseX + "px")
					.style("top", mouseY - 28 + "px");
				// tooltip text
				select(".tooltip h2").text(d.name);
				select(".tooltip .date").text(
					"from " + d.startLabel + " to " + d.endLabel
				);
				select(".tooltip .type").text("type: " + d.us_me);
				select(".tooltip .attacker").text(
					"attacker: " + d.attacker_jurisdiction
				);
				select(".tooltip .target").text("target: " + d.name);
			})
			.on("mouseout", function (d) {
				select(".tooltip").style("visibility", "hidden");
			});

		// update
		dots
			.transition()
			.duration(500)
			.attr("r", radius)
			.attr("cx", (d) => d.x)
			.attr("cy", (d) => d.y)
			// tooltip
			.on("mouseover", (d, i) => {
				const mouseX = event.pageX;
				const mouseY = event.pageY;
				select(".tooltip")
					.style("left", mouseX + "px")
					.style("top", mouseY - 28 + "px")
					.style("opacity", 0)
					.transition()
					.duration(100)
					.style("visibility", "visible")
					.style("opacity", 1)
					.style("left", mouseX + "px")
					.style("top", mouseY - 28 + "px");
				// tooltip text
				select(".tooltip h2").text(d.name);
				select(".tooltip .date").text(
					"from " + d.startLabel + " to " + d.endLabel
				);
				select(".tooltip .type").text("type: " + d.us_me);
				select(".tooltip .attacker").text(
					"attacker: " + d.attacker_jurisdiction
				);
				select(".tooltip .target").text("target: " + d.name);
			})
			.on("mouseout", function (d) {
				select(".tooltip").style("visibility", "hidden");
			});

		// remove
		dots.exit().remove();

		// 	var formatAxis = format(".4r");

		// 	const xAxis = axisBottom().scale(xScale).tickFormat(formatAxis);

		// 	svg
		// 		.append("g")
		// 		.classed("x-axis", true)
		// 		.attr("transform", "translate(0," + height + ")")
		// 		.call(xAxis);
	};

	// Handler for dropdown value change
	var dropdownChange = function () {
		var newValue = select(this).property("value"),
			newData = valueMap[newValue];

		update(newData);
	};

	// Get names of cereals, for dropdown
	var value = Object.keys(valueMap).sort();

	var dropdown = select("#graph")
		.insert("select", "svg")
		.on("change", dropdownChange);

	dropdown
		.selectAll("option")
		.data(data)
		.enter()
		.append("option")
		.attr("value", function (d) {
			return d;
		})
		.text(function (d) {
			return d[0].toUpperCase() + d.slice(1, d.length); // capitalize 1st letter
		});

	var initialData = dataMap[data[0]];
	update(initialData);
};
