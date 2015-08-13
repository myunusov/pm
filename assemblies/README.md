Release Steps

#### 1. Create Milestone on gitHub 

Must be at last one clossed issue !
  
#### 2. Check Prject, Prepare POM's, make tag etc 

```
mvn release:prepare -PPROD,nexus,zip
```
    
#### 3. Deploy artifact on nexus and site on github. Create Release on gitHub and upload artifact. (see github-release-plugin)

```
mvn release:deploy -PPROD,nexus,zip
```
                         