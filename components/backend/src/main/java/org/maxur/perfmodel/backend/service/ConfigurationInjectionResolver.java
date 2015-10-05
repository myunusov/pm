package org.maxur.perfmodel.backend.service;

import org.glassfish.hk2.api.Injectee;
import org.glassfish.hk2.api.InjectionResolver;
import org.glassfish.hk2.api.ServiceHandle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import java.lang.reflect.Type;

import static java.lang.String.format;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>9/2/2015</pre>
 */
public class ConfigurationInjectionResolver implements InjectionResolver<Named> {

    private static final Logger LOGGER = LoggerFactory.getLogger(ConfigurationInjectionResolver.class);

    @Inject
    private PropertiesService propertiesService;

    @Override
    public Object resolve(Injectee injectee, ServiceHandle<?> root) {
        Named annotation = injectee.getParent().getAnnotation(Named.class);
        final String name = annotation.value();
        final Type type = injectee.getRequiredType();
        switch (type.getTypeName()) {
            case "java.lang.String": {
                return propertiesService.asString(name);
            }
            case "java.lang.Integer": {
                return propertiesService.asInteger(name);
            }
            case "java.net.URI": {
                return propertiesService.asURI(name);
            }
            default: {
                LOGGER.error("Unsupported property type {}", type.getTypeName());
                throw new IllegalStateException(format("Unsupported property type %s", type.getTypeName()));
            }
        }
    }

    @Override
    public boolean isConstructorParameterIndicator() { return false; }

    @Override
    public boolean isMethodParameterIndicator() { return false; }
}
