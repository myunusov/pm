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
import java.util.function.Function;

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
    public URI asURI(final String key) {
        return URI.create(asString(key));
    }

    @Override
    public String asString(final String key) {
        return getValue(key, this::getString);
    }

    @Override
    public Integer asInteger(final String key) {
        return getValue(key, this::getInt);
    }

    private <T> T getValue(final String key, final Function<String, T> method) {
        try {
            final T value = method.apply(key);
            LOGGER.info("Configuration parameter {} = '{}'", key, value);
            return value;
        } catch (ConfigException.Missing e) {
            LOGGER.error("Configuration parameter '{}' is not found.", key);
            throw e;
        }
    }

    private String getString(final String key) {
        try {
            return userConfig.getString(key);
        } catch (ConfigException.Missing e) {
            return defaultConfig.getString(key);
        }
    }

    private Integer getInt(final String key) {
        try {
            return userConfig.getInt(key);
        } catch (ConfigException.Missing e) {
            return defaultConfig.getInt(key);
        }
    }
}
