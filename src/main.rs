mod core_fn;
use core_fn::init;

use std::env;

fn main() {
    let args:Vec<String> = env::args().collect();
    println!("{}",args[1]);
    if args.len() >= 2 {
        if args[1] == "init" {
             init::initial();
            }
    }
}

