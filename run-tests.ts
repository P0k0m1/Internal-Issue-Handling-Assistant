import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function runTests() {
  console.log(
    '======================================================',
  );
  console.log(
    '       Employee Request API - HTTP Tests',
  );
  console.log(
    '======================================================\n',
  );

  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  await app.listen(3030);

  const baseUrl =
    'http://127.0.0.1:3030/requests';

  console.log(`Server running on ${baseUrl}\n`);

  try {
    // --------------------------------------------------
    // PHASE 1 - CREATE
    // --------------------------------------------------

    console.log('--- PHASE 1: CREATE REQUEST ---');

    let res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: 101,
        type: 'IT Problem',
        description:
          'My computer cannot connect to the network.',
      }),
    });

    let request = await res.json();

    console.log(
      `POST /requests -> ${res.status}`,
    );
    console.log(
      `Request ID: ${request.request_id}\n`,
    );

    const requestId = request.request_id;

    // --------------------------------------------------
    // PHASE 2 - CLASSIFICATION
    // --------------------------------------------------

    console.log(
      '--- PHASE 2: CLASSIFICATION ---',
    );

    res = await fetch(
      `${baseUrl}/${requestId}/classify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'IT',
          confidence: 0.95,
          sensitive: false,
        }),
      },
    );

    request = await res.json();

    console.log(
      `POST /requests/:id/classify -> ${res.status}`,
    );
    console.log(
      `Status: ${request.status}\n`,
    );

    // --------------------------------------------------
    // PHASE 3 - ROUTING
    // --------------------------------------------------

    console.log('--- PHASE 3: ROUTING ---');

    res = await fetch(
      `${baseUrl}/${requestId}/route`,
      {
        method: 'POST',
      },
    );

    request = await res.json();

    console.log(
      `POST /requests/:id/route -> ${res.status}`,
    );
    console.log(
      `Assigned to: ${request.assigned_to}`,
    );
    console.log(
      `Status: ${request.status}\n`,
    );

    // --------------------------------------------------
    // PHASE 4 - REVIEW
    // --------------------------------------------------

    console.log('--- PHASE 4: REVIEW ---');

    res = await fetch(
      `${baseUrl}/${requestId}/review`,
      {
        method: 'POST',
      },
    );

    request = await res.json();

    console.log(
      `POST /requests/:id/review -> ${res.status}`,
    );
    console.log(
      `Status: ${request.status}\n`,
    );

    // --------------------------------------------------
    // PHASE 5 - IN PROGRESS
    // --------------------------------------------------

    console.log(
      '--- PHASE 5: START WORK ---',
    );

    res = await fetch(
      `${baseUrl}/${requestId}/start`,
      {
        method: 'POST',
      },
    );

    request = await res.json();

    console.log(
      `POST /requests/:id/start -> ${res.status}`,
    );
    console.log(
      `Status: ${request.status}\n`,
    );

    // --------------------------------------------------
    // PHASE 6 - RESOLVE
    // --------------------------------------------------

    console.log('--- PHASE 6: RESOLVE ---');

    res = await fetch(
      `${baseUrl}/${requestId}/resolve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution_type: 'Remote Fix',
          message:
            'The network configuration was fixed remotely.',
        }),
      },
    );

    request = await res.json();

    console.log(
      `POST /requests/:id/resolve -> ${res.status}`,
    );
    console.log(
      `Resolution: ${request.resolution_type}`,
    );
    console.log(
      `Status: ${request.status}\n`,
    );

    // --------------------------------------------------
    // PHASE 7 - INVALID TRANSITION
    // --------------------------------------------------

    console.log(
      '--- PHASE 7: INVALID TRANSITION ---',
    );

    res = await fetch(
      `${baseUrl}/${requestId}/resolve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution_type: 'Live Chat',
          message: 'Trying again.',
        }),
      },
    );

    console.log(
      `Resolve already resolved request -> ${res.status}`,
    );

    if (res.status === 400) {
      console.log(
        'PASS: Invalid transition rejected.\n',
      );
    } else {
      console.log(
        'FAIL: Invalid transition was accepted.\n',
      );
    }

    // --------------------------------------------------
    // PHASE 8 - HISTORY
    // --------------------------------------------------

    console.log('--- PHASE 8: HISTORY ---');

    res = await fetch(
      `${baseUrl}/${requestId}/history`,
    );

    const history = await res.json();

    console.log(
      `GET /requests/:id/history -> ${res.status}`,
    );
    console.log(
      `History entries: ${history.length}`,
    );

    history.forEach(
      (entry: any, index: number) => {
        console.log(
          `  ${index + 1}. ${
            entry.old_status || 'NULL'
          } -> ${entry.new_status}`,
        );
      },
    );

    console.log();

    // --------------------------------------------------
    // PHASE 9 - LOW CONFIDENCE
    // --------------------------------------------------

    console.log(
      '--- PHASE 9: LOW CONFIDENCE ---',
    );

    res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: 102,
        type: 'Unknown Problem',
        description:
          'I am not sure which department can help me.',
      }),
    });

    const unclearRequest = await res.json();

    res = await fetch(
      `${baseUrl}/${unclearRequest.request_id}/classify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'Other',
          confidence: 0.4,
          sensitive: false,
        }),
      },
    );

    const clarificationRequest =
      await res.json();

    console.log(
      `Classification -> ${clarificationRequest.status}`,
    );

    if (
      clarificationRequest.status ===
      'Needs Clarification'
    ) {
      console.log(
        'PASS: Low confidence requires clarification.',
      );
    }

    // --------------------------------------------------
    // PHASE 10 - SENSITIVE REQUEST
    // --------------------------------------------------

    console.log(
      '\n--- PHASE 10: SENSITIVE REQUEST ---',
    );

    res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: 103,
        type: 'Sensitive Request',
        description:
          'I need help with a sensitive employee matter.',
      }),
    });

    const sensitiveRequest =
      await res.json();

    res = await fetch(
      `${baseUrl}/${sensitiveRequest.request_id}/classify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'Other',
          confidence: 0.95,
          sensitive: true,
        }),
      },
    );

    await res.json();

    res = await fetch(
      `${baseUrl}/${sensitiveRequest.request_id}/route`,
      {
        method: 'POST',
      },
    );

    const routedSensitiveRequest =
      await res.json();

    console.log(
      `Assigned to: ${routedSensitiveRequest.assigned_to}`,
    );

    if (
      routedSensitiveRequest.assigned_to ===
      'HR_QUEUE'
    ) {
      console.log(
        'PASS: Sensitive request routed to HR.',
      );
    }

    console.log(
      '\n======================================================',
    );
    console.log('                 TESTS COMPLETED');
    console.log(
      '======================================================',
    );
  } finally {
    await app.close();
  }
}

runTests().catch((error) => {
  console.error('\nTests failed:', error);
  process.exit(1);
});
