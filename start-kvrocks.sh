docker run --rm --name kvrocks -p 6666:6666 -it apache/kvrocks:nightly-20250119-571b022 --workers 1 --rocksdb.block_cache_size 128