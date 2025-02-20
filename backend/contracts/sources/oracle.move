
module admin::oracle {
    use std::signer;
    use std::vector;
    use std::aptos_hash;
    use aptos_std::table;

    const ENotOwner: u64 = 0;

    public struct Oracle has key {
        indexes: table::Table<vector<u8>, u64>,
    }

    fun create_oracle_key(category_id: u8, city_name: vector<u8>): vector<u8> {
        let hash_key = vector::empty<u8>();
        vector::push_back(&mut hash_key, category_id);
        vector::append(&mut hash_key, city_name);
        aptos_hash::keccak256(hash_key)
    }

    public entry fun set_value(caller: &signer, category_id: u8, city_name: vector<u8>, value: u64) acquires Oracle {
        let oracle = borrow_global_mut<Oracle>(signer::address_of(caller));

        let hash = create_oracle_key(category_id, city_name);
        if (oracle.indexes.contains(hash)) {
            *table::borrow_mut(&mut oracle.indexes, hash) = value;
        } else {
            oracle.indexes.add(hash, value);
        }
    }

    #[view]
    public fun get_value(oracle_addr: address, category_id: u8, city_name: vector<u8>): u64 acquires Oracle {
        let oracle = borrow_global<Oracle>(oracle_addr);
        let hash = create_oracle_key(category_id, city_name);
        *table::borrow(&oracle.indexes, hash)
    }

    //fun init_everything(oracle: &mut Oracle) {
    //    let hash = create_oracle_key(0, b"hongkong");
    //    table::add(&mut oracle.indexes, hash, 0);
    //    hash = create_oracle_key(0, b"singapore");
    //    table::add(&mut oracle.indexes, hash, 0);
    //    hash = create_oracle_key(0, b"dubai");
    //    table::add(&mut oracle.indexes, hash, 0);
    //    hash = create_oracle_key(0, b"london");
    //    table::add(&mut oracle.indexes, hash, 0);
    //    hash = create_oracle_key(0, b"sydney");
    //    table::add(&mut oracle.indexes, hash, 0);
    //    hash = create_oracle_key(0, b"melbourne");
    //    table::add(&mut oracle.indexes, hash, 0);
    //    hash = create_oracle_key(0, b"adelaide");
    //    table::add(&mut oracle.indexes, hash, 0);
    //    hash = create_oracle_key(0, b"brisbane");
    //    table::add(&mut oracle.indexes, hash, 0);
    //}

    public entry fun init_everything(caller: &signer) acquires Oracle {
        //let oracle = borrow_global_mut<Oracle>(signer::address_of(caller));
        set_value(caller, 0, b"hongkong", 0);
        set_value(caller, 0, b"singapore", 0);
        set_value(caller, 0, b"dubai", 0);
        set_value(caller, 0, b"london", 0);
        set_value(caller, 0, b"sydney", 0);
        set_value(caller, 0, b"melbourne", 0);
        set_value(caller, 0, b"adelaide", 0);
        set_value(caller, 0, b"brisbane", 0);
    }

    fun init_module(account: &signer) {
        let oracle = Oracle {
            indexes: table::new(),
        };

        move_to(account, oracle);
    }

}
