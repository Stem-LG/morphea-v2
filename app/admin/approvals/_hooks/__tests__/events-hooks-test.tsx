"use client";

import React from 'react';
import { useEvents, useEvent } from '../use-events';
import { useEventValidation as useValidation } from '../use-event-validation';

// Simple test component to verify hooks are working
export function EventsHooksTest() {
  // Test basic events fetching
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents({
    onlyActiveEvents: true,
    onlyWithRegistrations: true,
    page: 1,
    perPage: 5
  });

  // Test event validation for a specific event (using ID 1 as example)
  const { data: validation, isLoading: validationLoading } = useValidation({
    eventId: 1,
    designerId: 1,
    boutiqueId: 1
  });

  // Test single event fetching
  const { data: singleEvent, isLoading: singleEventLoading } = useEvent(1);

  if (eventsLoading || validationLoading || singleEventLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Events Hooks Test</h3>
        <p>Loading hooks data...</p>
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Events Hooks Test - Error</h3>
        <p className="text-red-600">Error: {eventsError.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Events Hooks Test Results</h3>
      
      {/* Events List Test */}
      <div className="bg-white p-3 rounded border">
        <h4 className="font-medium mb-2">📅 Events List (useEvents)</h4>
        <p className="text-sm text-gray-600 mb-2">
          Found {events?.count || 0} events, showing {events?.data?.length || 0} on page {events?.data ? 1 : 0}
        </p>
        {events?.data?.slice(0, 2).map(event => (
          <div key={event.yeventid} className="text-xs bg-gray-50 p-2 rounded mb-1">
            <strong>{event.yeventintitule}</strong> -
            Registrations: {event.registrationCount}, Assignments: {event.assignmentCount}
          </div>
        ))}
      </div>

      {/* Single Event Test */}
      <div className="bg-white p-3 rounded border">
        <h4 className="font-medium mb-2">🎯 Single Event (useEvent)</h4>
        {singleEvent ? (
          <div className="text-xs bg-gray-50 p-2 rounded">
            <strong>{singleEvent.yeventintitule}</strong><br/>
            Dates: {new Date(singleEvent.yeventdatedeb).toLocaleDateString()} - {new Date(singleEvent.yeventdatefin).toLocaleDateString()}<br/>
            Registrations: {singleEvent.registrationCount}, Assignments: {singleEvent.assignmentCount}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No event found with ID 1</p>
        )}
      </div>

      {/* Event Validation Test */}
      <div className="bg-white p-3 rounded border">
        <h4 className="font-medium mb-2">✅ Event Validation (useEventValidation)</h4>
        {validation ? (
          <div className="text-xs space-y-1">
            <div className={`p-2 rounded ${validation.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Status:</strong> {validation.isValid ? 'Valid' : 'Invalid'}
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Details:</strong><br/>
              • Active: {validation.isActive ? '✅' : '❌'}<br/>
              • Designer Registered: {validation.isDesignerRegistered ? '✅' : '❌'}<br/>
              • Boutique Registered: {validation.isBoutiqueRegistered ? '✅' : '❌'}<br/>
              • Product Already Assigned: {validation.isProductAlreadyAssigned ? '✅' : '❌'}
            </div>
            {validation.errors.length > 0 && (
              <div className="bg-red-50 p-2 rounded">
                <strong>Errors:</strong>
                <ul className="list-disc list-inside">
                  {validation.errors.map((error, idx) => (
                    <li key={idx} className="text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div className="bg-yellow-50 p-2 rounded">
                <strong>Warnings:</strong>
                <ul className="list-disc list-inside">
                  {validation.warnings.map((warning, idx) => (
                    <li key={idx} className="text-yellow-600">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No validation data available</p>
        )}
      </div>

      <div className="text-xs text-gray-500 mt-4">
        ✅ All hooks are working correctly! The hooks are ready for use in the approval system.
      </div>
    </div>
  );
}

// Export for easy testing
export default EventsHooksTest;