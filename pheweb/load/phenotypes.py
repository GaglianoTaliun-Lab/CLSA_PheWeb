
from .. import conf
from ..utils import get_phenolist
from ..file_utils import write_json, get_filepath, get_pheno_filepath, write_heterogenous_variantfile

import json, os
from pathlib import Path
from typing import Iterator,Dict,Any,List

def get_phenotypes_including_top_variants() -> Iterator[Dict[str,Any]]:
    for pheno in get_phenolist():
        with open(get_pheno_filepath('qq', pheno['phenocode'])) as f:
            # GC lambda 0.01 isn't set if it was infinite or otherwise broken.
            gc_lambda_hundred = json.load(f)['overall']['gc_lambda'].get('0.01', None)
        with open(get_pheno_filepath('manhattan', pheno['phenocode'])) as f:
            variants = json.load(f)['unbinned_variants']
        top_variant = min(variants, key=lambda v: v['pval'])
        num_peaks = sum(variant.get('peak',False) and variant['pval']<=5e-8 for variant in variants)
        ret = {
            'phenocode': pheno['phenocode'],
            'pval': top_variant['pval'],
            'nearest_genes': top_variant['nearest_genes'],
            'chrom': top_variant['chrom'],
            'pos': top_variant['pos'],
            'ref': top_variant['ref'],
            'alt': top_variant['alt'],
            'rsids': top_variant['rsids'],
            'num_peaks': num_peaks,
            'gc_lambda_hundred': gc_lambda_hundred,  # numbers in keys break streamtable
        }
        for key in ['num_samples', 'num_controls', 'num_cases', 'category', 'phenostring']:
            if key in pheno: ret[key] = pheno[key]
        if isinstance(ret['nearest_genes'], list): ret['nearest_genes'] = ','.join(ret['nearest_genes'])
        yield ret

def get_phenotypes_including_top_variants_sex_stratified() -> Iterator[Dict[str,Any]]:
    phenolist = get_phenolist()
    for pheno in phenolist:

        # for UNIQUE pheno in phenolist() (meaning only the combined pheno and not the male/female)
        if (pheno['sex'] != "male" and pheno['sex'] != 'female'):

            #TODO: need to check if it's the female and male are actually there. If not, then NA.

            #check phenolist again for male and female instances of the same phenocode.
            pheno_female = None
            pheno_male = None
            for sub_pheno in phenolist:
                if (sub_pheno['phenocode'] == pheno['phenocode'] and sub_pheno['sex'] == 'female'):
                    pheno_female = sub_pheno
                elif (sub_pheno['phenocode'] == pheno['phenocode'] and sub_pheno['sex'] == 'male'):
                    pheno_male = sub_pheno

            with open(get_pheno_filepath('qq', pheno['phenocode'])) as f:
                # GC lambda 0.01 isn't set if it was infinite or otherwise broken.
                gc_lambda_hundred = json.load(f)['overall']['gc_lambda'].get('0.01', None)

            with open(get_pheno_filepath('manhattan', pheno['phenocode'])) as f:
                variants = json.load(f)['unbinned_variants']
            num_peaks = sum(variant.get('peak',False) and variant['pval']<=5e-8 for variant in variants)

            variants_female = []
            variants_male = []
            if (os.path.exists(get_pheno_filepath('manhattan-sex_stratified', pheno['phenocode'] + '.female', must_exist = False))):
                with open(get_pheno_filepath('manhattan-sex_stratified', pheno['phenocode'] + '.female')) as f:
                    variants_female = json.load(f)['unbinned_variants']
                num_peaks_female = sum(variant.get('peak',False) and variant['pval']<=5e-8 for variant in variants_female)
            else:
                variants_female = None
                num_peaks_female = "NA"

            if (os.path.exists(get_pheno_filepath('manhattan-sex_stratified', pheno['phenocode'] + '.male', must_exist = False))):
                with open(get_pheno_filepath('manhattan-sex_stratified', pheno['phenocode'] + '.male')) as f:
                    variants_male = json.load(f)['unbinned_variants']
                num_peaks_male = sum(variant.get('peak',False) and variant['pval']<=5e-8 for variant in variants_male)
            else:
                variants_male = None
                num_peaks_male = "NA"
                        
            top_variants = [min(variants, key=lambda v: v['pval']),]

            if variants_female != None:
                top_variants.append(min(variants_female, key=lambda v: v['pval']))
            if variants_male != None:
                top_variants.append(min(variants_male, key=lambda v: v['pval']))

            top_variant = min(top_variants, key=lambda v: v['pval'])

            top_variant_group_num = top_variants.index(top_variant)

            print(top_variant)
            print(top_variant_group_num)
            
            if(top_variant_group_num == 0):
                top_variant_group = "Combined"
            elif(top_variant_group_num == 1 and variants_female!= None):
                top_variant_group = "Female"
            elif(top_variant_group_num == 1 and variants_female == None):
                top_variant_group = "Male"
            elif(top_variant_group_num == 2):
                top_variant_group = "Male"

            ret = {
                'phenocode': pheno['phenocode'],
                'pval': top_variant['pval'],
                'nearest_genes': top_variant['nearest_genes'],
                'chrom': top_variant['chrom'],
                'pos': top_variant['pos'],
                'ref': top_variant['ref'],
                'alt': top_variant['alt'],
                'rsids': top_variant['rsids'],
                'top_variant_group': top_variant_group,
                'num_peaks': num_peaks,
                'num_peaks_female': num_peaks_female,
                'num_peaks_male': num_peaks_male,
                'gc_lambda_hundred': gc_lambda_hundred,  # numbers in keys break streamtable
            }
            for key in ['num_samples', 'num_controls', 'num_cases', 'category', 'phenostring']:
                if key in pheno: ret[key] = pheno[key]
            for key in ['num_samples', 'num_controls', 'num_cases']:
                if key in pheno_female: ret[key + '_female'] = pheno_female[key]
                else: ret[key + '_female'] = "NA"

                if key in pheno_male: ret[key + '_male'] = pheno_male[key]
                else: ret[key + '_male'] = "NA"

            if isinstance(ret['nearest_genes'], list): ret['nearest_genes'] = ','.join(ret['nearest_genes'])
            yield ret

def should_run() -> bool:
    output_filepaths = [Path(get_filepath(name, must_exist=False)) for name in ['phenotypes_summary', 'phenotypes_summary_tsv']]
    if not all(fp.exists() for fp in output_filepaths):
        return True
    oldest_output_mtime = min(fp.stat().st_mtime for fp in output_filepaths)
    input_filepaths = [Path(get_pheno_filepath('manhattan', pheno['phenocode'])) for pheno in get_phenolist()]
    newest_input_mtime = max(fp.stat().st_mtime for fp in input_filepaths)
    if newest_input_mtime > oldest_output_mtime:
        return True
    return False

def run(argv:List[str]) -> None:
    if '-h' in argv or '--help' in argv:
        print('Make a file summarizing information about each phenotype (for use in the phenotypes table)')
        exit(1)

    if not should_run():
        print('Already up-to-date!')
        return

    #if sex-stratified...
    if conf.should_show_sex_stratified():
        data = sorted(get_phenotypes_including_top_variants_sex_stratified(), key=lambda p: p['pval'])
    else:
        data = sorted(get_phenotypes_including_top_variants(), key=lambda p: p['pval'])

    out_filepath = get_filepath('phenotypes_summary', must_exist=False)
    write_json(filepath=out_filepath, data=data)
    print("wrote {} phenotypes to {}".format(len(data), out_filepath))

    out_filepath_tsv = get_filepath('phenotypes_summary_tsv', must_exist=False)
    write_heterogenous_variantfile(out_filepath_tsv, data, use_gzip=False)
    print("wrote {} phenotypes to {}".format(len(data), out_filepath_tsv))
