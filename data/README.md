For us:
- [ ] Webpage: pheno.html: 1 <-> 4 QQ.
- [ ] Mark peaks better.
    - While variants w/ p<1e-4: m_s_v = min(significant_variants, key=_.pval); m_s_v.showgene=True; significant_variants = [v for v in significant_variants if abs(v.pos-m_s_v.pos) > 100k]
    - [ ] Then peaks with p<1e-8 get gene labels, and peaks with p<1e-6 go in StreamTable.
- [ ] LZ should have current chr:start-end in URL and on page.
- [ ] Highlight the thing you clicked to get to the current page.
- [ ] GWAS Catalog hits on Manhattan Plots
    - statistically match GWAS Catalog mapped_traits to our phenotypes (even if they're not Vanderbilt ICD9 PheWAS) and then offer the top matches with checkboxes.
        - What statistic should happen here? For a [mapped_trait, pheno] pair, we have [(chr:pos, pval), ...].
        - For each known hit, find the smallest pval in ±100kb.  Now, given the list of [(gwas_pval, our_pval), ...], use sumproduct or RMS_product on neglog10s.
    - on LZ, just show all GWAS Catalog hits.
- [ ] Show GWAS Catalog info on variant.html (using rs#)
- [ ] Understand GTEx (see GTEx.txt)
- [ ] Show a table of significant phenos on index.html.
- [ ] Invert colors (like ctrl-opt-com-8)?

For others:
- [ ] Merge 0_1 into 0_2 to cut down tmp file usage by ~5X.  Then put strict assertions around the input parser.
    - `CpraReader(input_file_parser.get_variants(f))`
- [ ] Write a Makefile to do all of this?  Snakemake?
- [ ] Keep annotations separate from data, and maybe put data into hdf5 or flat files to save some space.
    - Maybe add row# into annotations (sites.tsv) to index into the matrices.
    - Maybe keep separate row-major and column-major matrices, or just a separate file for each phenotype.
- [ ] Separate out icd9 info.
    - `autocomplete.py`: for now, just add a flag.
    - 2_make_pheno_json.py:
        - make the make_pheno pipeline run before any other.
            - 0_make_phenos_json
            - then others can use phenos.json
        - no more `phenos.csv`.  Go straight to `phenos.json`.  Put it in `$data_dir`.
        - Just specify the output format and offer a pipeline for icd9s.
        - Configure which phenos.json-maker runs using `config.config`.
    - template/pheno.html: for now, just add a flag.
- [ ] Make things more generic to handle more kinds of data without forking:
    - 0_make_phenos_json.py
        - imports input_file_handlers/get_phenos_using_glob.py
        - imports input_file_handlers/augment_phenos_using_icd9_info.py
        - imports input_file_handlers/num_cases_controls_from_input_files.py (hard-coded to 'NS.C{TRL,ASE}')
    - 1_get_cpras_to_use.py
        - imports input_file_handlers/epacts.py
        - makes a queue that specifies whether each file is raw or standardized, and wraps raw files in `input_file_handler.get_variants()`
    - 2_annotate_sites.py
        - writing bgzip from python:
            - bgzf writer: <http://biopython.org/DIST/docs/api/Bio.bgzf-pysrc.html>
            - write into subprocess? somewhat gross.
    - 3_make_tries.py
    - 4_1_augment_each_pheno.py (also does bgzip/tabix, but then we'll need )
    - 4_3_manhattan.py
    - 4_4_qq.py
    - 5_1_make_matrix.sh (also does bgzip/tabix)
        - reading/writing bgzip in c++:


Info:
- 39355320 variants in each input file I checked
- 7878230 variants in `cpra-any.tsv`. (MAF>0.01 in at least one pheno)
- 7878127 variants in any pheno, with sorted alt.
- 7602114 variants in `cpra-all.tsv`. (MAF>0.01 in all phenos) (except 769 350.3 350.6)
- 1448 phenos
- But `cat phenos.json | grep "\": {" | wc -l` finds only 1440.  Which 8 had <20 cases?


Timing:
- 0_1: ~6 hrs (~10 min/pheno) (think)
- 0_2:
    - 21 min (all, 8-at-a-time)
    - 13 min (any, 8-at-a-time)
    - 24 min (any, 4-at-a-time)
    - slower with io.open(fname, buffering=2**16)
    - 30 min (any, 8-at-a-time, sorted alt)
- 1_2: 8 min
- 1_3: 10 sec
- 1_4: 9 min
- 1_5: 40 sec
- 1_6: 30 sec
- 1_7: 20 sec
- 1_8: 1 min
- 2: .
- 3_1: ~6 hrs
- 3_2: ~1 hr (2 min/pheno) (guess)
- 3_3: ~1 hr (2 min/pheno) (guess)
- 4_1: ~5 hr
- 4_2: 1.7 hr