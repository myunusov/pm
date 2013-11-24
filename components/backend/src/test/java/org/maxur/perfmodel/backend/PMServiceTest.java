package org.maxur.perfmodel.backend;

import org.junit.Before;

/**
 * @author Maxim Yunusov
 * @version 1.0 23.09.13
 */
public class PMServiceTest {

    private ProjectService service;

    @Before
    public void setUp() throws Exception {
        service = new ProjectService();
    }

}