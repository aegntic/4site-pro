// Test the URL auto-completion logic extracted from App.tsx

function processUrlInput(value) {
    console.log('1. Input value:', value);
    
    let expandedUrl = '';
    let shouldShow = false;
    
    if (value.match(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)) {
        expandedUrl = `https://github.com/${value}`;
        console.log('2. Expanded URL:', expandedUrl);
        shouldShow = true;
    } else if (value.match(/^github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)) {
        expandedUrl = `https://${value}`;
        console.log('2. Expanded URL:', expandedUrl);
        shouldShow = true;
    } else if (value.startsWith('github.com/')) {
        expandedUrl = `https://${value}`;
        console.log('2. Expanded URL:', expandedUrl);
        shouldShow = true;
    }
    
    return { expandedUrl, shouldShow };
}

// Test cases
const testCases = [
    {
        input: 'aegntic/DAILYDOCO',
        expected: 'https://github.com/aegntic/DAILYDOCO',
        shouldShow: true,
        description: 'Standard owner/repo format'
    },
    {
        input: 'facebook/react',
        expected: 'https://github.com/facebook/react',
        shouldShow: true,
        description: 'Another owner/repo format'
    },
    {
        input: 'microsoft/vscode',
        expected: 'https://github.com/microsoft/vscode',
        shouldShow: true,
        description: 'Owner with underscore/repo'
    },
    {
        input: 'github.com/aegntic/DAILYDOCO',
        expected: 'https://github.com/aegntic/DAILYDOCO',
        shouldShow: true,
        description: 'Github.com prefix format'
    },
    {
        input: 'https://github.com/aegntic/DAILYDOCO',
        expected: '',
        shouldShow: false,
        description: 'Full URL (should not show preview)'
    },
    {
        input: 'not-a-repo-format',
        expected: '',
        shouldShow: false,
        description: 'Invalid format (should not show preview)'
    },
    {
        input: '',
        expected: '',
        shouldShow: false,
        description: 'Empty input'
    }
];

console.log('🧪 Testing URL Auto-completion Logic\n');

let passCount = 0;
let totalCount = testCases.length;

testCases.forEach((testCase, index) => {
    console.log(`\n--- Test ${index + 1}: ${testCase.description} ---`);
    const result = processUrlInput(testCase.input);
    
    const isPass = (result.expandedUrl === testCase.expected) && 
                  (result.shouldShow === testCase.shouldShow);
    
    if (isPass) passCount++;

    console.log(`Input: "${testCase.input}"`);
    console.log(`Expected: "${testCase.expected}" (show: ${testCase.shouldShow})`);
    console.log(`Actual: "${result.expandedUrl}" (show: ${result.shouldShow})`);
    console.log(`Result: ${isPass ? '✅ PASS' : '❌ FAIL'}`);
});

console.log(`\n🎯 Test Summary: ${passCount}/${totalCount} tests passed`);
console.log(passCount === totalCount ? '🎉 All tests passed!' : '⚠️ Some tests failed');

// Special test for the user's specific request
console.log('\n🎯 User Request Test:');
console.log('Input: "aegntic/DAILYDOCO"');
const userTest = processUrlInput('aegntic/DAILYDOCO');
console.log(`Should show preview: ${userTest.shouldShow}`);
console.log(`Preview URL: ${userTest.expandedUrl}`);
console.log(`User expectation met: ${userTest.shouldShow && userTest.expandedUrl === 'https://github.com/aegntic/DAILYDOCO' ? '✅ YES' : '❌ NO'}`);