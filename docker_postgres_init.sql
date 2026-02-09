CREATE USER people WITH PASSWORD 'people' CREATEDB;
CREATE DATABASE people
    WITH
    OWNER = people
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;