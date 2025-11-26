#!/bin/bash

# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kyawhtay",
    "password": "password",
    "email": "kyawhtay@example.com",
    "firstName": "kyaw",
    "lastName": "htay"
  }'