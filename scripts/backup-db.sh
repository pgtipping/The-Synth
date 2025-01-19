#!/bin/bash

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups/database"
mkdir -p $BACKUP_DIR

# Generate timestamp for backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/synthalyst_blog_$TIMESTAMP.sql"

# Create the backup
PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U $DB_USER Synthalyst_Blog > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz" 