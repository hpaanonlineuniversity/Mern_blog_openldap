#!/bin/bash

##curl -X GET http://localhost:3000/health \

# Test login with example admin user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kyawhtay",
    "password": "password"
  }'