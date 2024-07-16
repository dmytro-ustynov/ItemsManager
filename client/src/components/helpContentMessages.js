export const helpMessages = {
    t1: {
        "UA": "Інструкція користувача",
        "EN": "Users Manual"
    },
    c1: {
        "UA": "Як створити користувача",
        "EN": "How to create user"
    },
    c2: {
        "UA": "Як сконфігурувати служби",
        "EN": "How to use configure services"
    },
    c3: {
        "UA": "Як використовувати масову загрузку",
        "EN": "How to use bulk upload"
    },
    c4: {
        "UA": "Як підготувати файл для масової загрузки",
        "EN": "How to prepare xls file for bulk upload"
    },
    m1: {
        "UA": "Ви можете скористатися вбудованою адмінкою для створення користувача.  Перейдіть за посиланням ",
        "EN": "You may use built-in swagger to create root user. Go to "
    },
    m1_1: {
        "UA": "Створіть користувача, натисніть 'Try it out' та впишіть імя \"root\" та бажаний пароль. Це можна зробити лише раз, тому запамʼятайте пароль root користувача, він знадобиться Вам для активації нових користувачів",
        "EN": "Create user using this endpoint, Press 'Try it out'  and write username \"root\" and password as json. Remember the root password, you will need it to approve other users."
    },
    m3_list: {
        "UA": ["Найменування", "Інвентарний номер", "Служба"],
        "EN": ["Найменування", "Інвентарний номер", "Служба"],
    },
    m2_1: {
        "UA": "Заповніть `config.yaml` - впишіть сюди ті служби, які  Ви будете мати серед свого майна. Ви можете додавати свої служби, або видалити ті що в прикладі. Налаштуйте кольори для приємнішого відображення списку, використовуйте назви кольорів як прийнято в css , або hex номери. Наприклад:",
        "EN": "Fill the `config.yaml` with  services you want to have in your app. You may add new services, or delete existing ones. Adjust colors, for better representation in a list, use css names for colors, or hex  numbers like:"
    },
    m3: {
        "UA": "Ви можете використати \"Масову загрузку з Excel\" для додавання багатьох елементів одразу. Підготуйте файл `xls` з наступними стовпчиками:",
        "EN": "You may use \"Bulk upload from Excel\" for uploading multiple items. Prepare xls file with the following columns: "
    },
    m3_1: {
        "UA": "Тож створіть  `xls` файл, що матиме такі стовпчики. Перший рядок цього файлу буде сприйматися як шапка, і назви атрибутів будуть братися звідси. Починаючи із другого рядка кожний рядок до першого пустого буде ввжатися одним елементом, що додається із відповідними атрибутами. Кожний рядок - це новий елемент. Пусті значення в рядках дозволяються, окрім стовпчика \"Найменування\". Як тільки буде знайдена пуста перша клітинка - це розцінюється як кінець таблиці.",
        "EN": "Create `xls` file that will have such columns with these names, the first row on the sheet will be considered as property names, and starting from the row 2 all lines will be considered as items. Every line is the item to create and insert to DB with property that is written in the corresponding column. Empty cells are allowed except column \"Найменування\". Once the empty first cell in a row was found - this will be considered as the end of the table."
    },
    m3_2: {
        "UA": "Зверніть увагу, в стовпчику `\"Служба\"` варто вписувати саме такі назви служби як ви додавали в налаштуваннях в файлі `config.yaml` file. Це потрібно для коректного відображення в тих кольорах, що ви налаштували. \n В файлі ексель ви можете додати будь які інші потрібні Вам стовпчики (властивості) майна.",
        "EN": "The values in column `\"Служба\"` should be the same as you specified in the `config.yaml` file. This is required for good representation of the item list.\n Any other fields (columns) you may add on your demands."
    },

}