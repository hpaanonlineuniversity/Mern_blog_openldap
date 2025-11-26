FROM osixia/openldap:latest

# Set maintainer label
LABEL maintainer="hpaanonlineuniversity@gmail.com"

# Create the bootstrap schema directory
RUN mkdir -p /container/service/slapd/assets/config/bootstrap/schema
RUN mkdir -p /container/service/slapd/assets/config/bootstrap/ldif

# Copy custom schema files
COPY schema.ldif /container/service/slapd/assets/config/bootstrap/schema/100-user_schema.ldif

# Copy backup users to bootstrap ldif directory (it will be processed automatically)
COPY backupusers.ldif /container/service/slapd/assets/config/bootstrap/ldif/50-backupusers.ldif

# Set proper permissions
RUN chown openldap:openldap /container/service/slapd/assets/config/bootstrap/schema/*.ldif
RUN chown openldap:openldap /container/service/slapd/assets/config/bootstrap/ldif/*.ldif

EXPOSE 389 636