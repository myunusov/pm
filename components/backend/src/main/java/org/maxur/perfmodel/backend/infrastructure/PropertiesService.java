/*
 * Copyright (c) 2014 Maxim Yunusov
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package org.maxur.perfmodel.backend.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * @author Maxim
 * @version 1.0
 * @since <pre>20.10.2014</pre>
 */
public class PropertiesService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PropertiesService.class);

    private Properties properties;

    public PropertiesService(final Properties properties) {
        this.properties = properties;
    }

    public static PropertiesService make(final String name) {
        return new PropertiesService(loadProperties(name));
    }

    private static Properties loadProperties(final String name) {
        final InputStream in = PropertiesService.class.getResourceAsStream(name);
        if (in == null) {
            LOGGER.error("Property file is not founded");
            throw new IllegalStateException("Property file is not founded");
        }
        final Properties prop = new Properties();
        try {
            prop.load(in);
        } catch (IOException e) {
            LOGGER.error("Property file is not loaded", e);
            throw new IllegalStateException("Property file is not loaded", e);
        }
        return prop;
    }

    public String asString(final String key) {
        return properties.get(key).toString();
    }

    /**
     * Returns Properties value as string.
     * If value is not exist returns default value.
     * It's private method, so all deault values are same.
     *
     * @param key property key
     * @param defaultValue property defaulrt value
     * @return
     */
    private String asString(final String key, final String defaultValue) {
        Object value = properties.get(key);
        return value == null ? defaultValue : value.toString();
    }


    public String webAppFolderName() {
        return asString("webapp.folderName", "webapp/");
    }

    public String baseUrl() {
        return asString("webapp.url", "http://localhost:8080/");
    }

    public String dbPath() {
        return asString("db.fileName", "data/projects.ser");
    }
}
