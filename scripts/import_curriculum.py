"""Import all instructional guides as staged, source-backed lessons.

This preserves the source documents and does not claim content/audio verification.
"""
from pathlib import Path
import hashlib
import json
import re
import shutil
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / 'public/media/curriculum'
OUT = ROOT / 'src/content/curriculum.json'
MEDIA.mkdir(parents=True, exist_ok=True)
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
STAGES = ['theory', 'guide', 'small', 'full', 'review']
assets = []

def text(node):
    return '\n'.join(''.join(t.text or '' for t in p.findall('.//w:t', NS)) for p in node.findall('.//w:p', NS)) if node.tag.endswith('}tbl') else ''.join(t.text or '' for t in node.findall('.//w:t', NS))

def read_document(path, prefix):
    blocks = []
    with zipfile.ZipFile(path) as package:
        rels = ET.fromstring(package.read('word/_rels/document.xml.rels'))
        targets = {r.attrib['Id']: r.attrib['Target'] for r in rels}
        body = ET.fromstring(package.read('word/document.xml')).find('w:body', NS)
        for index, node in enumerate(body):
            key = f'{prefix}-{index}'
            content = text(node).strip()
            if node.tag.endswith('}p') and content:
                style_node = node.find('w:pPr/w:pStyle', NS)
                style = style_node.attrib.get('{'+NS['w']+'}val', '') if style_node is not None else ''
                heading = style.lower().startswith('heading') or style in ['1','2','3']
                # Listening guides use plain paragraphs for their numbered headings.
                heading = heading or bool(re.match(r'^(?:[IVX]+\.\s|[EFWP]\d+[. ·]|Task \d+\s)', content))
                blocks.append({'id': key, 'kind': 'text', 'text': content, 'heading': heading, 'style': style})
            elif node.tag.endswith('}tbl'):
                rows = []
                for row in node.findall('w:tr', NS):
                    rows.append(['\n'.join(''.join(t.text or '' for t in p.findall('.//w:t', NS)) for p in cell.findall('.//w:p', NS)).strip() for cell in row.findall('w:tc', NS)])
                blocks.append({'id': key, 'kind': 'table', 'rows': rows})
            for n, image in enumerate(node.findall('.//a:blip', NS)):
                relation_id = image.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                if not relation_id:
                    continue
                target = targets[relation_id]
                name = f'{prefix}-{Path(target).name}'
                destination = MEDIA / name
                raw = package.read('word/' + target)
                destination.write_bytes(raw)
                if not any(a['path'] == name for a in assets):
                    assets.append({'path': name, 'source': path.relative_to(ROOT).as_posix(), 'packagePath': 'word/' + target, 'sha256': hashlib.sha256(raw).hexdigest()})
                blocks.append({'id': f'{key}-image-{n}', 'kind': 'image', 'url': '/media/curriculum/'+name, 'alt': f'Hình trong tài liệu {path.stem}. Mở ảnh gốc để xem chi tiết.'})
    return blocks

def lesson(unit_id, title, skill, part, source):
    return {'id': unit_id, 'title': title, 'skill': skill, 'part': part, 'source': source.relative_to(ROOT).as_posix(), 'stages': {stage: [] for stage in STAGES}, 'linkedActivities': []}

def add_audio(unit, stage, file, prefix):
    if not file.exists():
        raise FileNotFoundError(file)
    name = prefix+'-'+file.name
    destination = MEDIA / name
    shutil.copyfile(file, destination)
    unit['stages'][stage].append({'id': unit['id']+'-'+stage+'-'+file.stem, 'kind': 'audio', 'url': '/media/curriculum/'+name, 'text': file.name})
    assets.append({'path': name, 'source': file.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()})

units = []
listening = next((ROOT/'Listening').glob('*.docx'))
blocks = read_document(listening, 'listening')
starts = [i for i,b in enumerate(blocks) if b.get('text','').startswith('IELTS LISTENING PART ')]
for n, begin in enumerate(starts):
    group = blocks[begin:starts[n+1] if n+1 < len(starts) else len(blocks)]
    unit = lesson(f'listening-{n+1}', group[0]['text'].split(': ',1)[-1].title(), 'Listening', f'Part {n+1}', listening)
    stage = 'theory'
    if n == 0:
        unit['stages']['theory'].extend(blocks[:begin])
    for block in group[1:]:
        value = block.get('text','')
        match = re.match(r'^([IVX]+)\.\s',value)
        if match:
            stage = {'I':'theory','II':'guide','III':'small','IV':'full','V':'review','VI':'review'}.get(match[1],stage)
        unit['stages'][stage].append(block)
    add_audio(unit,'small',ROOT/'Listening'/f'Part{n+1}_Small_Exercises.mp3','listening')
    add_audio(unit,'full',ROOT/'Listening'/f'Part{n+1}_Full_Test.mp3','listening')
    if n == 0: unit['linkedActivities'] = ['listening-westlake']
    units.append(unit)

for folder, skill in [('Speaking','Speaking'),('Writing','Writing')]:
    for file in sorted((ROOT/folder).glob('*.docx')):
        number = int(re.search(r'(?:Part|Task)_(\d)',file.name)[1])
        prefix = skill.lower()+'-'+str(number)
        blocks = read_document(file,prefix)
        unit = lesson(prefix, f'{skill} '+('Part ' if skill=='Speaking' else 'Task ')+str(number), skill, ('Part ' if skill=='Speaking' else 'Task ')+str(number), file)
        stage = None
        introduction = []
        for block in blocks:
            value = block.get('text','')
            match = re.match(r'^Part ([1-5])\s*(?:[–-]\s*)?(?:Theory|Small|Planning|Information|Idea|Full|Complete)',value,re.I)
            if match and (block.get('heading') or block.get('style') in ['2']):
                stage = {'1':'theory','2':'small','3':'guide','4':'full','5':'review'}[match[1]]
            elif value == 'Complete answer key' and block.get('heading'):
                stage = 'review'
            elif value == 'Language reference' and block.get('heading'):
                stage = 'review'
            if stage:
                unit['stages'][stage].append(block)
            else:
                introduction.append(block)
        unit['stages']['theory'] = introduction + unit['stages']['theory']
        if skill == 'Speaking':
            for audio in sorted((ROOT/'Speaking'/f'Audio_Part_{number}').glob('*.mp3')):
                stage = 'small' if audio.name.startswith('E') else 'guide' if audio.name.startswith('P') else 'full'
                add_audio(unit,stage,audio,prefix)
            if number == 1: unit['linkedActivities'] = ['speaking-study']
        else:
            unit['linkedActivities'] = ['writing-bakeries' if number == 1 else 'writing-food']
        units.append(unit)

reading = next((ROOT/'Reading').glob('*.docx'))
blocks = read_document(reading,'reading')
key_start = next(i for i,b in enumerate(blocks) if b.get('text') == 'Complete answer key')
starts = [i for i,b in enumerate(blocks[:key_start]) if re.match(r'^[1-8]\.\s',b.get('text','')) and b.get('heading')]
keys = [i for i,b in enumerate(blocks[key_start:],key_start) if re.match(r'^[1-8]\.\s',b.get('text','')) and b.get('heading')]
common = next(i for i,b in enumerate(blocks) if b.get('text') == 'Common mistakes and review')
for n,begin in enumerate(starts):
    group = blocks[begin:starts[n+1] if n+1 < len(starts) else key_start]
    unit = lesson(f'reading-{n+1}', group[0]['text'].split('. ',1)[-1], 'Reading', 'Question type '+str(n+1), reading)
    stage = 'theory'
    for block in group[1:]:
        value = block.get('text','')
        if value.startswith('Theory &'): stage = 'theory'
        elif value == 'Small exercise': stage = 'small'
        elif value == 'Planning guide': stage = 'guide'
        elif value.startswith('Full exercise'): stage = 'full'
        # A passage can precede the Full exercise heading: keep it with the task.
        if value == 'Reading passage' and stage == 'guide': stage = 'full'
        unit['stages'][stage].append(block)
    unit['stages']['review'] = blocks[keys[n]:keys[n+1] if n+1 < len(keys) else common]
    unit['stages']['theory'] = blocks[:starts[0]] + unit['stages']['theory']
    unit['stages']['review'].extend(blocks[common:])
    if n == 0: unit['linkedActivities'] = ['reading-museum','reading-garden']
    units.append(unit)

for unit in units:
    for stage in STAGES:
        if not unit['stages'][stage]:
            raise ValueError(f'Missing source stage {unit["id"]}/{stage}; do not invent lesson content.')

OUT.write_text(json.dumps(units,ensure_ascii=False,indent=2),encoding='utf-8')
lesson_directory = ROOT/'public/curriculum'
lesson_directory.mkdir(parents=True,exist_ok=True)
for unit in units:
    (lesson_directory/(unit['id']+'.json')).write_text(json.dumps(unit,ensure_ascii=False),encoding='utf-8')
(ROOT/'src/content/curriculum-index.json').write_text(json.dumps([{k:v for k,v in unit.items() if k != 'stages'} for unit in units],ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'src/content/curriculum-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Imported {len(units)} lessons, {sum(len(u["stages"][s]) for u in units for s in STAGES)} source blocks, {len(assets)} media assets.')
for unit in units:
    print(unit['id'],{s:len(unit['stages'][s]) for s in STAGES})
