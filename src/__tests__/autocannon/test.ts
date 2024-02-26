import autocannon from 'autocannon';

function runProductListTest() {
    const url = 'http://localhost:8080/api/v1/product/list';
    const body = JSON.stringify({
        limit:  100,
        offset:  0,
        sortFilter: "highestPrice"
        // sort: 'asc',
    });

    const options = {
        url,
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/json',
        },
        // Additional options for Autocannon, such as concurrency, duration, etc.
        connections: 10,
        duration: 10, // seconds
    };

    autocannon({ ...options, method: "POST" }, (err, result) => {
        if (err) {
            console.error('Error running test:', err);
            return;
        }

        console.log('Test completed:', result);
    });
}

runProductListTest();