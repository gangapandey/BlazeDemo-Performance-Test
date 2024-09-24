# BlazeDemo Performance Testing with JMeter


## Project Description
A performance testing project using Apache JMeter to evaluate the performance of the BlazeDemo flight booking website.

## Test Scenarios
Outline the key test scenarios you worked on:
- Homepage: Select departure and destination cities, and find flights.
- Flight Search: View available flights and select a flight.
- Purchase: Complete the flight purchase form and confirm.

## Technologies Used
- Apache JMeter
- BlazeMeter (for recording the initial test flow)
- CSV Data Set Config 
- JMeter CLI 
- HTML Reports 

## Setup Instructions

### Prerequisites:
- Apache JMeter installed on your local machine.
- JDK installed.

### Steps to Run the Test:
1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/BlazeDemo-Performance-Test.git
    cd BlazeDemo-Performance-Test
    ```

2. Open the `blazedemo.jmx` file in JMeter.

3. Update any test parameters (if necessary) in the JMeter script.

4. Run the test by clicking the Run button or via the command line:

    ```bash
    jmeter -n -t scripts/blazedemo.jmx -l results/results.csv -e -o results/report/
    ```




