// Initialize database at .achoz file if not exist and all initial tables. 

use std::path::Path;
use std::fs;
use rusqlite::{params,Connection,Result};

pub fn initial() {
    let path = Path::new(".achoz");
    if path.exists() {
        println!(".achoz already exist in current directoy")
    } else {
        let path = Path::new(".achoz");
        match fs::create_dir(path) {
            Ok(()) => {
                // initialize database and tables. 
                match initialize_db() {
                    Ok(()) => println!("achoz initialized successfully: "),
                    Err(error) => println!("Error while creating database: {}",error),
                }
            },
            Err(error) => println!("Error while creating .achoz dir: {}",error),
        }
    }
}

fn initialize_db() -> Result<()> {
    // creating main db which contains directory which will be tracked for crawling.
    let conn = Connection::open(".achoz/db")?;
    conn.execute(
        "CREATE TABLE main_tree (
                  id              INTEGER PRIMARY KEY,
                  checksum        TEXT NOT NULL,
                  fullpath        TEXT NOT NULL,
                  modified_time   INTEGER,
                  changed_time    INTEGER,
                  is_crawled      BOOLEAN,
                  is_indexed      BOOLEAN
                  )",
        params![],
    )?;
    Ok(())
}