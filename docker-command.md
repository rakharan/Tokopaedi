# start in development
 ```
    docker-compose -f docker-compose.yml -f docker-compose-dev.yml up --build -d
 ```

 # start in production
 ```
    docker-compose -f docker-compose.yml -f docker-compose-prod.yml up --build -d
 ```

 # stop container
 ```
   docker-compose down -v
 ```