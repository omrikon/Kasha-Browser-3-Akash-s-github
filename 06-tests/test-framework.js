// ============================================================================
// TEST-FRAMEWORK.JS - Test Framework and Test Runner
// ============================================================================
// This file contains the test framework that runs all the game's tests.
// It provides functions to create test cases, run tests, and report results.
// Think of it as a simple testing system that checks if your code works
// the way you expect it to.
// ============================================================================

// This message appears in the browser console when the file loads
console.log('Loading test framework...');

// ============================================================================
// TEST FRAMEWORK SETUP
// ============================================================================
// These variables track how many tests we've run and their results.
// ============================================================================

// Count how many tests have passed (worked correctly)
let testsPassed = 0;

// Count how many tests have failed (didn't work as expected)
let testsFailed = 0;

// Array to store information about tests that failed
// This helps us see what went wrong
let failedTests = [];

// Array to store all test results for detailed reporting
let testResults = [];

// Track if we're currently running tests
let testsRunning = false;

// ============================================================================
// TEST ASSERTION FUNCTIONS
// ============================================================================
// These functions check if something is true or false, and record the result.
// An "assertion" is a statement that should be true if the code works correctly.
// ============================================================================

// Check if a value is true (like checking if a door is unlocked)
// If it's false, the test fails and we record what went wrong
function assertTrue(condition, message) {
    // message is what we'll show if the test fails - explains what we were checking
    if (!condition) {
        // Test failed - condition was false
        const error = new Error(message || 'Assertion failed: expected true');
        testsFailed++;
        failedTests.push({
            message: message || 'Expected true, got false',
            error: error
        });
        testResults.push({ passed: false, message: message || 'Expected true, got false' });
        throw error; // Stop execution and report the failure
    } else {
        // Test passed - condition was true
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Assertion passed' });
    }
}

// Check if a value is false (like checking if a door is locked)
function assertFalse(condition, message) {
    // If condition is true when we expect false, the test fails
    if (condition) {
        const error = new Error(message || 'Assertion failed: expected false');
        testsFailed++;
        failedTests.push({
            message: message || 'Expected false, got true',
            error: error
        });
        testResults.push({ passed: false, message: message || 'Expected false, got true' });
        throw error;
    } else {
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Assertion passed' });
    }
}

// Check if two values are equal (like checking if two coins have the same value)
function assertEquals(actual, expected, message) {
    // actual is what we got, expected is what we should get
    if (actual !== expected) {
        const error = new Error(message || `Expected ${expected}, got ${actual}`);
        testsFailed++;
        failedTests.push({
            message: message || `Expected ${expected}, got ${actual}`,
            actual: actual,
            expected: expected,
            error: error
        });
        testResults.push({ 
            passed: false, 
            message: message || `Expected ${expected}, got ${actual}`,
            actual: actual,
            expected: expected
        });
        throw error;
    } else {
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Values match' });
    }
}

// Check if two values are NOT equal (like checking if two items are different)
function assertNotEquals(actual, expected, message) {
    if (actual === expected) {
        const error = new Error(message || `Expected not ${expected}, but got ${expected}`);
        testsFailed++;
        failedTests.push({
            message: message || `Expected not ${expected}, but got ${expected}`,
            error: error
        });
        testResults.push({ passed: false, message: message || `Expected not ${expected}, but got ${expected}` });
        throw error;
    } else {
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Values differ as expected' });
    }
}

// Check if a value is null or undefined (like checking if something doesn't exist)
function assertNull(value, message) {
    if (value !== null && value !== undefined) {
        const error = new Error(message || `Expected null/undefined, got ${value}`);
        testsFailed++;
        failedTests.push({
            message: message || `Expected null/undefined, got ${value}`,
            actual: value,
            error: error
        });
        testResults.push({ passed: false, message: message || `Expected null/undefined, got ${value}` });
        throw error;
    } else {
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Value is null/undefined' });
    }
}

// Check if a value is NOT null or undefined (like checking if something exists)
function assertNotNull(value, message) {
    if (value === null || value === undefined) {
        const error = new Error(message || 'Expected value to exist, got null/undefined');
        testsFailed++;
        failedTests.push({
            message: message || 'Expected value to exist, got null/undefined',
            error: error
        });
        testResults.push({ passed: false, message: message || 'Expected value to exist, got null/undefined' });
        throw error;
    } else {
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Value exists' });
    }
}

// Check if a value is approximately equal (for floating point numbers)
// This is needed because computers sometimes have tiny rounding errors
function assertApproxEquals(actual, expected, tolerance, message) {
    // tolerance is how close the values need to be (e.g., 0.01 means within 1%)
    const difference = Math.abs(actual - expected);
    if (difference > tolerance) {
        const error = new Error(message || `Expected approximately ${expected}, got ${actual} (difference: ${difference})`);
        testsFailed++;
        failedTests.push({
            message: message || `Expected approximately ${expected}, got ${actual}`,
            actual: actual,
            expected: expected,
            difference: difference,
            error: error
        });
        testResults.push({ 
            passed: false, 
            message: message || `Expected approximately ${expected}, got ${actual}`,
            actual: actual,
            expected: expected
        });
        throw error;
    } else {
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Values are approximately equal' });
    }
}

// Check if an array contains a value (like checking if an item is in inventory)
function assertContains(array, value, message) {
    if (!array.includes(value)) {
        const error = new Error(message || `Expected array to contain ${value}`);
        testsFailed++;
        failedTests.push({
            message: message || `Expected array to contain ${value}`,
            array: array,
            value: value,
            error: error
        });
        testResults.push({ passed: false, message: message || `Expected array to contain ${value}` });
        throw error;
    } else {
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Array contains value' });
    }
}

// Check if an array does NOT contain a value
function assertNotContains(array, value, message) {
    if (array.includes(value)) {
        const error = new Error(message || `Expected array NOT to contain ${value}`);
        testsFailed++;
        failedTests.push({
            message: message || `Expected array NOT to contain ${value}`,
            array: array,
            value: value,
            error: error
        });
        testResults.push({ passed: false, message: message || `Expected array NOT to contain ${value}` });
        throw error;
    } else {
        testsPassed++;
        testResults.push({ passed: true, message: message || 'Array does not contain value' });
    }
}

// ============================================================================
// TEST RUNNER FUNCTIONS
// ============================================================================
// These functions help organize and run tests.
// ============================================================================

// Run a single test function and catch any errors
// This allows tests to fail without stopping all tests
function runTest(testName, testFunction) {
    try {
        // Call the test function - if it throws an error, the test failed
        testFunction();
        // If we get here, the test passed (no errors thrown)
        console.log(`✅ ${testName}`);
    } catch (error) {
        // Test failed - log it but continue running other tests
        console.error(`❌ ${testName}: ${error.message}`);
    }
}

// Run a group of tests (a test suite)
// This helps organize tests by feature or module
function runTestSuite(suiteName, tests) {
    console.log(`\n📦 Running test suite: ${suiteName}`);
    console.log('='.repeat(50));
    
    const suiteStartTime = Date.now();
    
    // Run each test in the suite
    for (const test of tests) {
        runTest(test.name, test.func);
    }
    
    const suiteEndTime = Date.now();
    const suiteDuration = suiteEndTime - suiteStartTime;
    
    console.log(`\n✅ Suite "${suiteName}" completed in ${suiteDuration}ms`);
}

// Run all tests and show a summary
function runAllTests() {
    console.log('\n🧪 Starting Test Suite');
    console.log('='.repeat(50));
    
    // Reset counters
    testsPassed = 0;
    testsFailed = 0;
    failedTests = [];
    testResults = [];
    testsRunning = true;
    
    const startTime = Date.now();
    
    // Note: Individual test suites will be run from their respective files
    // This function is called after all test files have been loaded
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    testsRunning = false;
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);
    
    if (testsFailed > 0) {
        console.log('\n❌ FAILED TESTS:');
        console.log('='.repeat(50));
        failedTests.forEach((failure, index) => {
            console.log(`${index + 1}. ${failure.message}`);
            if (failure.actual !== undefined && failure.expected !== undefined) {
                console.log(`   Expected: ${failure.expected}`);
                console.log(`   Got: ${failure.actual}`);
            }
        });
    } else {
        console.log('\n🎉 All tests passed!');
    }
    
    console.log('='.repeat(50));
    
    // Update HTML display if it exists
    updateTestResults();
    
    return {
        passed: testsPassed,
        failed: testsFailed,
        duration: duration,
        results: testResults
    };
}

// Update the HTML page with test results (if test runner page exists)
function updateTestResults() {
    // Try to find elements on the page to update
    const passedElement = document.getElementById('tests-passed');
    const failedElement = document.getElementById('tests-failed');
    const durationElement = document.getElementById('test-duration');
    const resultsElement = document.getElementById('test-results');
    
    if (passedElement) {
        passedElement.textContent = testsPassed;
    }
    if (failedElement) {
        failedElement.textContent = testsFailed;
    }
    if (durationElement) {
        durationElement.textContent = `${Date.now() - (window.testStartTime || Date.now())}ms`;
    }
    if (resultsElement) {
        resultsElement.innerHTML = '';
        
        // Show failed tests first
        if (failedTests.length > 0) {
            const failedSection = document.createElement('div');
            failedSection.innerHTML = '<h3>❌ Failed Tests</h3>';
            failedTests.forEach((failure, index) => {
                const failureDiv = document.createElement('div');
                failureDiv.className = 'test-failure';
                failureDiv.innerHTML = `
                    <strong>${index + 1}. ${failure.message}</strong>
                    ${failure.actual !== undefined ? `<br>Expected: ${failure.expected}, Got: ${failure.actual}` : ''}
                `;
                failedSection.appendChild(failureDiv);
            });
            resultsElement.appendChild(failedSection);
        }
        
        // Show summary
        const summary = document.createElement('div');
        summary.className = 'test-summary';
        summary.innerHTML = `
            <h3>📊 Summary</h3>
            <p>Passed: ${testsPassed} | Failed: ${testsFailed} | Total: ${testsPassed + testsFailed}</p>
        `;
        resultsElement.appendChild(summary);
    }
}

// Helper function to create a test object
function createTest(name, func) {
    return { name: name, func: func };
}

console.log('Test framework loaded successfully');
