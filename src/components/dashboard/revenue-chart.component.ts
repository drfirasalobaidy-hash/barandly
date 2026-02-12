import { Component, ElementRef, ViewChild, AfterViewInit, input, effect } from '@angular/core';

declare const d3: any;

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  template: `<div #chartContainer class="w-full h-64"></div>`
})
export class RevenueChartComponent implements AfterViewInit {
  data = input.required<{ date: string; value: number }[]>();
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  constructor() {
    effect(() => {
      if (this.data() && this.chartContainer) {
        this.drawChart();
      }
    });
  }

  ngAfterViewInit() {
    this.drawChart();
  }

  drawChart() {
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = this.data();

    // X Axis
    const x = d3.scalePoint()
      .domain(data.map((d: any) => d.date))
      .range([0, width]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr('color', '#94a3b8');

    // Y Axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.value) * 1.2])
      .range([height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', '#94a3b8');

    // Line
    const line = d3.line()
      .x((d: any) => x(d.date)!)
      .y((d: any) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "svgGradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("class", "start")
      .attr("offset", "0%")
      .attr("stop-color", "#6366f1")
      .attr("stop-opacity", 1);

    gradient.append("stop")
      .attr("class", "end")
      .attr("offset", "100%")
      .attr("stop-color", "#818cf8")
      .attr("stop-opacity", 0.2);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 3)
      .attr('d', line);
      
    // Area under line
    const area = d3.area()
        .x((d: any) => x(d.date)!)
        .y0(height)
        .y1((d: any) => y(d.value))
        .curve(d3.curveMonotoneX);
        
    svg.append("path")
       .datum(data)
       .attr("class", "area")
       .attr("d", area)
       .attr("fill", "url(#svgGradient)")
       .attr("opacity", 0.3);

    // Dots
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: any) => x(d.date)!)
      .attr('cy', (d: any) => y(d.value))
      .attr('r', 4)
      .attr('fill', '#fff')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2);
  }
}