# Group3_Project3
This project seeks to investigate the correlation between crime rates and unemployment. To accomplish this, we will utilize various governmental datasets to create interactive maps, showcasing both crime and employment rates within the same time frames. We will be attempting to use around eight years of data within these datasets. 

To maintain ethical integrity, we omitted demographic data, preventing potential misuse of our findings. Only state-level data was pulled and analyzed to preserve anonymity, avoid the reinforcement of stereotypes, avoid disciminatory interpretations, and generate an unbiased analysis of unemployment rates relative to crime rates. It is also important to note that, due to our limited project time, we were only able to find historical data for crime and unemployment rates from 2014 to 2022. This short timeline limits the statistical significance of our findings, and we have included p-values within our visuzalizations to highlight the lack of significance. Thus, while some r-values appear to indicate strong correlations, it is important to note that they lack a sufficient p-value to make them relevant. A greater span of historical data would be required to produce reliable data. Finally, group 3 would like to acknowledge that ChatGPT 4 was used in the development of our project. 

## Folders

### **data_cleaning**
A collection of jupyter notebooks dedicated to pulling and cleaning data.

#### **crime_stats**
- Pulling crime information from the FBI's crime database via API (https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/docApi)
#### **unemployment_stats**
- Pulling unemployment information from the U.S. Bureau of Labor Statistics (BLS) via API (https://www.bls.gov/developers/api_signature_v2.htm)

### **clean_data**
Clean data produced within **data_cleaning** is pushed to this folder. There are also a number of .csv's that we pulled from .gov and .org websites. Additionally, there are .json files that have been converted from the .csv files so that they can be better used with out .js code.

### **Visualizations**
There is where the visualizations for our project stored. Each visualization was created indiviaully and then combined within our **dashboard.js** file. 
#### **BubbleMap** ####
Bubble map that creates a bubble map based where the bubble's size is dependent on the reports of crime relative to the state. Map can be filtered by crime type. 
#### **TimeSeriesPlot** ####
Time series plot that contains two plot lines: the rate of unemployment by state over time, and the rate of a specified crime over time. 
#### **ChoroplethMap** ####
Choropleth map that can be filtered by crime to visually represnt how strong the correlation between unemployment rate and crime rate is for each state. Green represents postive correlations stronger than .5, indicating a rise in crime relative to the rise in unemployment. Red represents a negative correlations stronger than -.5, indicating a reduction in crime relative to the rise of unemployment.