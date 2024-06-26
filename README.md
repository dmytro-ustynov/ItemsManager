# ItemsManager

Item managing web-application for internal use. Quick search, filter and export items, writing notes, adding useful details about items and tangibles.  

![img.png](images/img.png)

## Main features

This app was build as an internal use tool to manage items - quickly find them make essential notes for them, sort and filter according to most common requests in my department - like find me all items that are older than 2014 year.

The search works by name or by inventory number

Everyone who has access to the tool can search , filter and export the list, but only authorized admin can add notations, add new field (property) to the existing item, or add a new one.

## Decisions

Mongo DB was chosen since there are no relations between instances here , and mostly those instances may have different properties , because they go from different Service Department where they used to store them in xls tables and those tables have different titles.

## Deploy and run

1. Git clone this repo:
   
 ```git clone https://github.com/dmytro-ustynov/ItemsManager.git``` 
 
 
2. Create `.env` file from `.env.example` template:

 ```cp .env.example .env```
 

3. Fill empty lines in .env file -- credentials for DB and secret strings. You may create strong secret string or password with the  command:

```
openssl rand -base64 12 
# This will output smth like: WvWG/9DFiENuJStn 
```

4. Build and run containers with the command:

`docker-compose up -d`
Wait for a while until containers are being built and started.
After proces was finished you should see:
```
Creating items-db ... done
Creating items-server ... done
Creating items-client ... done
```

5. Ready to go! Visit http://localhost and you will see running application. But it has an empty list yet.

6. Load items to DB. You may upload the collection to MongoDB Manually, or create admin user and load them from xls file.

7. Create admin user. Go to http://localhost:5000/docs#/user/user_signup_user_signup_post. 
 - Create user using this endpoint, Press try it put and write username and password as json. Not well secured, I know, but you need it only once. And it fits well for internal use. And for every other admin user you will utilize operating this app.

8. Prepare xls table with items you want to add.
Required fields are only :
- Найменування
- Інвентарний номер
- Служба

Create xls file that will have such columns with these names, the first row on the sheet will be considered as property names, and starting from the row 2 all lines will be considered as items. Every line is the item to create and insert to DB with property that is written in the corresponding column. Once the empty first cell in a row was found - this will be considered as the end of the table

9. Use bulk upload to add all your items from xls to DB.
