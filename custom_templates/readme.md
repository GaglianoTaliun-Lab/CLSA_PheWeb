CARTaGENE custom_template 

as per https://github.com/statgen/pheweb/blob/master/etc/detailed-webserver-instructions.md, these files supersede default PheWeb pages. 
These are bootstrap enabled and should be written in html. Only specific file names will supersede default cosmetic aspect of PheWeb :


  custom_templates/about/content.html: contents of the about page  
  custom_templates/index/h1.html: large title above the search bar on the homepage  
  custom_templates/index/below-h1.html: subtext above the search bar on the homepage  
  custom_templates/index/below-query.html: beneath the search bar on the homepage  
  custom_templates/pheno/h1.html: the large text at the top of the phenotype (Manhattan Plot) page  
  custom_templates/region/h1.html: the large text at the top of the region (LocusZoom Region Plot) page  
  custom_templates/title.html: the title of the window, usually shown in the tab bar  
  
Images : to properly display images, the file requieres to be within the /static/ directory within the pheweb/serve repository.
