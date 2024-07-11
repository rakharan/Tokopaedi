/* v8 ignore start */
import autocannon from 'autocannon';

function runProductListTest() {
    const url = 'http://localhost:8080/api/v1/product/list';
    const body = JSON.stringify({
        limit: 100,
        lastId: 0,
        sortFilter: "highestPrice",
        sort: 'ASC'
    });

    const options: autocannon.Options = {
        url,
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/json',
        },
        // Additional options for Autocannon, such as concurrency, duration, etc.
        connections: 10,
        duration: 10, // seconds
        title: "Product List Load Test",
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
/* v8 ignore stop */