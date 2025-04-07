package com.chuyendeweb2.group05.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface ProductImageStorageService {
    /**
     * Initialize the storage service
     */
    void init();

    /**
     * Save a file and return the filename
     * 
     * @param file The file to save
     * @return The generated filename
     * @throws IOException If there is an error saving the file
     */
    String save(MultipartFile file) throws IOException;

    /**
     * Load a file by filename
     * 
     * @param filename The filename to load
     * @return The file resource
     */
    Resource load(String filename);

    /**
     * Delete all files in the storage
     */
    void deleteAll();

    /**
     * Delete a specific file by filename
     * 
     * @param filename The filename to delete
     * @return true if successfully deleted, false otherwise
     */
    boolean delete(String filename);

    /**
     * Get all stored files
     * 
     * @return Stream of all paths
     */
    Stream<Path> loadAll();

    /**
     * Get the URL for an image by filename
     * 
     * @param filename The filename
     * @return The URL to access the image
     */
    String getImageUrl(String filename);
}