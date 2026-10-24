import pubchempy as pcp

compound = pcp.Compound.from_cid(1423)
print(compound.molecular_formula)
print(compound.iupac_name)
print(compound.molecular_weight)
print(compound.xlogp)


for compound in pcp.get_compounds("glucose", "name"):
    print(compound.cid)
    print(compound.smiles)


c = pcp.Compound.from_cid(962)
c.to_dict(properties=["atoms", "bonds", "inchi"])
{'atoms': [{'aid': 1, 'element': 'o', 'x': 2.5369, 'y': -0.155},
           {'aid': 2, 'element': 'h', 'x': 3.0739, 'y': 0.155},
           {'aid': 3, 'element': 'h', 'x': 2, 'y': 0.155}],
 'bonds': [{'aid1': 1, 'aid2': 2, 'order': 'single'},
           {'aid1': 1, 'aid2': 3, 'order': 'single'}],
 'inchi': u'InChI=1S/H2O/h1H2'}

print(c)


print(pcp.get_compounds("Aspirin", "name", record_type="3d"))