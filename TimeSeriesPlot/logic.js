let data; // Declare the data variable in a higher scope

document.addEventListener('DOMContentLoaded', () => {
  fetchDataAndInitialize();
});

async function fetchDataAndInitialize() {
  try {
    const response = await fetch('../Visualizations/Data/merged_unemployment_and_crime_rates.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    data = await response.json(); // Assign the data to the variable in the higher scope

    if (!Array.isArray(data)) {
      throw new Error('Invalid JSON format');
    }

    initializeDropdowns(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function initializeDropdowns(data) {
  // Extract unique states and crimes
  const uniqueStates = Array.from(new Set(data.map(entry => entry.state_abbr)));
  const uniqueCrimes = Object.keys(data[0]).filter(key => key.endsWith('_rate'));

  // Populate state dropdown
  uniqueStates.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateDropdown.appendChild(option);
  });

  // Populate crime dropdown
  uniqueCrimes.forEach(crime => {
    const option = document.createElement('option');
    option.value = crime;
    option.textContent = crime.replace('_rate', ''); // Display without '_rate'
    crimeDropdown.appendChild(option);
  });

  // Add event listeners to dropdowns for updating the plot
  stateDropdown.addEventListener('change', updatePlot);
  crimeDropdown.addEventListener('change', updatePlot);

  // Initial plot with default selection
  plotTimeSeries(data, uniqueStates[0], uniqueCrimes[0]);
}

function updatePlot() {
  const selectedState = stateDropdown.value;
  const selectedCrime = crimeDropdown.value;

  // Update the plot with new selected values
  plotTimeSeries(data, selectedState, selectedCrime);
}

function plotTimeSeries(data, selectedState, selectedCrime) {
  const filteredData = data.filter(entry => entry.state_abbr === selectedState);

  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select('#timeSeriesChart')
    .html('') // Clear previous content
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear()
    .domain([d3.min(filteredData, d => d.data_year), d3.max(filteredData, d => d.data_year)])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => Math.max(d[selectedCrime], d.Unemployment_Rate))])
    .range([height, 0]);

  const lineCrime = d3.line()
    .x(d => xScale(d.data_year))
    .y(d => yScale(d[selectedCrime]));

  const lineUnemployment = d3.line()
    .x(d => xScale(d.data_year))
    .y(d => yScale(d.Unemployment_Rate));

  // Plot crime line
  svg.append('path')
    .datum(filteredData)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', lineCrime);

  // Plot unemployment line
  svg.append('path')
    .datum(filteredData)
    .attr('fill', 'none')
    .attr('stroke', 'red') // You can change the color as needed
    .attr('stroke-width', 2)
    .attr('d', lineUnemployment);

  // Create legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - 200},${10})`);

  legend.append('path')
    .attr('d', d3.line()([[0, 0], [30, 0]])) // Crime line
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  legend.append('text')
    .attr('x', 35)
    .attr('y', 0)
    .attr('dy', '0.32em')
    .text(selectedCrime.replace('_rate', '')); // Display without '_rate'

  legend.append('path')
    .attr('d', d3.line()([[0, 20], [30, 20]])) // Unemployment line
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  legend.append('text')
    .attr('x', 35)
    .attr('y', 20)
    .attr('dy', '0.32em')
    .text('Unemployment Rate');

  // Add x-axis
  svg.append('g')
  .attr('transform', `translate(0, ${height})`)
  .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))); // Use "d" format to remove commas

  // Add y-axis
  svg.append('g')
    .call(d3.axisLeft(yScale));

  // Add title with state and crime information
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text(`Unemployment Rate vs Crime Rate - ${selectedState}`);

  // Add legend title
  legend.append('text')
    .attr('x', 0)
    .attr('y', -5)
    .attr('text-anchor', 'start')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .text('Legend');
}


