#include "priveosend.hpp"

ACTION priveosend::upload(const name sender, const checksum256 hash, const std::string filename, const std::string mime){
  const auto idx = files.template get_index<"bykey"_n>();
  const auto itr = idx.find(hash);
  check(itr == idx.end(), "File already exists");
  files.emplace(sender, [&](auto& file) {
    file.id = files.available_primary_key();
    file.hash = hash;
    file.filename = filename;
    file.mime = mime;
    file.created_at = current_time_point();
    file.user = sender;
  });
}

ACTION priveosend::admclear(const name sender) {
  require_auth(_self);
  erase_all(files);
}