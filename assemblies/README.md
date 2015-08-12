Release Steps

#### 1. Create Milestone on gitHub 

Must be at last one clossed issue !

#### 2. Change download path in \PM\components\src\site\site.xml
 
 ```
<item name="Download" href="https://github.com/myunusov/pm/releases/download/v.2.1/assemblies-2.1.zip" />
 ```
  
#### 3. Check Prject, Prepare POM's, make tag etc 

```
mvn release:prepare -PPROD,nexus,zip
```
    
#### 4. Deploy artifact on nexus and site on github. Create Release on gitHub and upload artifact. (see github-release-plugin)

```
mvn release:deploy -PPROD,nexus,zip
```
                         