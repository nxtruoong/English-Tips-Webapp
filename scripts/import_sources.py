"""Reproducibly extract curated source excerpts without editing originals."""
from pathlib import Path
import json
import shutil
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'content'
MEDIA = ROOT / 'public' / 'media'
OUT.mkdir(parents=True, exist_ok=True)
MEDIA.mkdir(parents=True, exist_ok=True)
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}

def document(folder, pattern='*.docx'):
    path = next((ROOT / folder).glob(pattern))
    with zipfile.ZipFile(path) as package:
        root = ET.fromstring(package.read('word/document.xml'))
        paras = root.findall('.//w:p', NS)
        rows = [(''.join(t.text or '' for t in p.findall('.//w:t', NS)), p) for p in paras]
        rows = [(text, p) for text, p in rows if text.strip() or p.findall('.//a:blip', NS)]
        return path, rows

listening_path, listening_rows = document('Listening')
listening = [text for text, _ in listening_rows if text.strip()]
start = next(i for i, text in enumerate(listening) if text.startswith('Receptionist: Good morning'))
end = next(i for i in range(start, len(listening)) if listening[i].startswith('IELTS LISTENING PART 2'))
transcript = '\n\n'.join(listening[start:end])
shutil.copyfile(ROOT / 'Listening' / 'Part1_Full_Test.mp3', MEDIA / 'listening-part1.mp3')

speaking_path, speaking_rows = document('Speaking', '*Part_1.docx')
speaking = [text for text, _ in speaking_rows if text.strip()]
study_start = next(i for i, text in enumerate(speaking) if text == 'F3. Study')
study_questions = speaking[study_start + 2:study_start + 6]
models = [i for i, text in enumerate(speaking) if text.startswith('F3.') and i > study_start]
speaking_model = '\n\n'.join(speaking[models[-1] + 1: next(i for i in range(models[-1] + 1, len(speaking)) if speaking[i].startswith('F4.'))]) if models else ''

writing_path, writing_rows = document('Writing', '*Task_2*')
writing = [text for text, _ in writing_rows if text.strip()]
model_start = next(i for i, text in enumerate(writing) if text.startswith('Suggested complete response | 280 words'))
model_end = next(i for i in range(model_start, len(writing)) if writing[i] == 'Check the answer')
essay_model = '\n\n'.join(writing[model_start + 1:model_end])

task1_path, task1_rows = document('Writing', '*Task_1*')
start1 = next(i for i, (text, _) in enumerate(task1_rows) if text.startswith('Task 1 '))
end1 = next(i for i in range(start1 + 1, len(task1_rows)) if task1_rows[i][0].startswith('Task 2 '))
with zipfile.ZipFile(task1_path) as package:
    relations = ET.fromstring(package.read('word/_rels/document.xml.rels'))
    targets = {r.attrib['Id']: r.attrib['Target'] for r in relations}
    images = [b for _, p in task1_rows[start1:end1] for b in p.findall('.//a:blip', NS)]
    if not images:
        raise ValueError('Task 1 source graphic not found; do not substitute an unrelated image.')
    relation_id = images[0].attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed']
    target = targets[relation_id]
    suffix = Path(target).suffix
    image_name = 'writing-task1' + suffix
    (MEDIA / image_name).write_bytes(package.read('word/' + target))

task1 = [text for text, _ in task1_rows if text.strip()]
model_candidates = [i for i, text in enumerate(task1) if text.startswith('Task 1 ') and i > 500]
task1_model = ''
if model_candidates:
    begin = model_candidates[-1]
    finish = next((i for i in range(begin + 1, len(task1)) if task1[i].startswith('Task 2 ')), begin + 15)
    task1_model = '\n\n'.join(task1[begin + 1:finish])

data = {'listeningTranscript': transcript, 'speakingQuestions': study_questions, 'speakingModel': speaking_model, 'writingModel': essay_model, 'task1Image': '/media/' + image_name, 'task1Model': task1_model}
(OUT / 'excerpts.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
inventory = []
for path in ROOT.rglob('*.docx'):
    if 'node_modules' in path.parts:
        continue
    with zipfile.ZipFile(path) as package:
        root = ET.fromstring(package.read('word/document.xml'))
        paragraphs = [''.join(t.text or '' for t in p.findall('.//w:t', NS)) for p in root.findall('.//w:p', NS)]
        inventory.append({'source': path.relative_to(ROOT).as_posix(), 'paragraphs': sum(bool(p.strip()) for p in paragraphs), 'media': len([n for n in package.namelist() if n.startswith('word/media/')]), 'status': 'extracted-not-publication-verified'})
(OUT / 'inventory.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Extracted {len(inventory)} documents; copied Listening Part 1 and Task 1 graphic. Originals preserved.')
