package org.maxur.perfmodel.backend.service.impl;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigException;
import com.typesafe.config.ConfigFactory;
import org.jvnet.hk2.annotations.Service;
import org.maxur.perfmodel.backend.service.PropertiesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.net.URI;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>9/2/2015</pre>
 */
@Service
public class PropertiesServiceHoconImpl implements PropertiesService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PropertiesServiceHoconImpl.class);

    private Config defaultConfig;

    private Config userConfig;

    @PostConstruct
    public void init() {
        defaultConfig = ConfigFactory.load().getConfig("DEFAULTS");
        userConfig = ConfigFactory.load().getConfig("PMC");
    }


    @Override
    public String asString(final String key) {
        String value;
        try {
            try {
                value = userConfig.getString(key);
            } catch (ConfigException.Missing e) {
                value = defaultConfig.getString(key);
            }
        } catch (ConfigException.Missing e) {
            LOGGER.error("Configuration parameter '{}' is not found.", key);
            throw e;
        }
        LOGGER.info("Configuration parameter {} = '{}'", key, value);
        return value;
    }

    @Override
    public Integer asInteger(final String key) {
        Integer value;
        try {
            try {
                value = userConfig.getInt(key);
            } catch (ConfigException.Missing e) {
                value = defaultConfig.getInt(key);
            }
        } catch (ConfigException.Missing e) {
            LOGGER.error("Configuration parameter '{}' is not found.", key);
            throw e;
        }
        LOGGER.info("Configuration parameter {} = '{}'", key, value);
        return value;
    }

    @Override
    public URI asURI(final String key) {
        return URI.create(asString(key));
    }
}
