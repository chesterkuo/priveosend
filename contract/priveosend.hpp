#include <eosio/eosio.hpp>
#include <eosio/system.hpp>

using namespace eosio;

CONTRACT priveosend : public contract {
  public:
    using contract::contract;
    priveosend(name self, name code, datastream<const char*> ds) : 
      eosio::contract(self,code,ds),
      files(_self, _self.value)
      {}
        
    TABLE file {
      uint64_t id;
      std::string filename;
      std::string mime;
      checksum256 hash;
      time_point created_at;
      name user;
      
      uint64_t primary_key()const { return id; }
      
      checksum256 by_checksum()const { return hash; }
    };
    typedef eosio::multi_index< name("file"), file,
         indexed_by< "bykey"_n, const_mem_fun<file, checksum256,  &file::by_checksum> >
      > file_index;
    file_index files;
        
    ACTION upload(const name sender, const checksum256 hash, const std::string filename, const std::string mime);
    ACTION admclear(const name sender);
  
  private:
    template<typename T>
    static void erase_all(T& table) {
      auto itr = table.begin();
      while(itr != table.end()) {
        itr = table.erase(itr);
      }
    }
};