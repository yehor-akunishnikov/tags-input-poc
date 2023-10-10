document.addEventListener('DOMContentLoaded', () => {
class ParingsInput {
  constructor() {
    this.initState();
    this.setDomNodes();
    this.setListeners();
  }

  initState() {
    this.tags = [];
    this.paringBuffer = [];
    this.isMergeMode = false;
  }

  setDomNodes() {
    this.tagsInput = document.querySelector('#container');
    this.tagsListElement = this.tagsInput.querySelector('.tags');
    this.inputContainer = document.querySelector('.input-container');
    this.mergeButton = document.querySelector('#merge-button');
    this.applyButton = document.querySelector('#apply-merge');
    this.cancelButton = document.querySelector('#cancel-merge');
    this.resultBtn = document.querySelector('#result');
    this.inputField = document.querySelector('.input-field');
    this.resultText = document.querySelector('#resultText');
  }

  setListeners() {
    this.resultBtn.addEventListener('click', (e) => this.onResultClick(e));
    this.mergeButton.addEventListener('click', (e) => this.onMergeClick(e));
    this.applyButton.addEventListener('click', (e) => this.onApplyClick(e));
    this.inputField.addEventListener('keyup', (e) => this.onKeyUp(e));
    this.tagsListElement.addEventListener('click', (e) =>
      this.onTagsListClick(e)
    );
    this.cancelButton.addEventListener('click', () => {
      this.onCancelClick();
    });
  }

  onKeyUp(e) {
    const keyCode = e.keyCode;
    const value = this.inputField.value.replace(
      /[^a-zA-Z0-9А-ЩЬЮЯҐЄІЇа-щьюяґєії'` ]/g,
      ''
    );
    const isDuplicate = this.tags.some((tagText) => tagText === value);

    if (keyCode === 13 && value && !isDuplicate) {
      this.tags.push(value);
      this.tagsListElement.insertBefore(
        this.createTag(value),
        this.inputContainer
      );
      this.inputField.value = null;

      const charactersCount = this.tags.filter(
        (tagText) => !tagText.includes('/')
      ).length;

      if (charactersCount > 1) {
        this.mergeButton.classList.remove('hidden');
      }
    }
  }

  onTagClick(tag) {
    const isParing = tag.classList.contains('paring');

    if (this.isMergeMode && !isParing) {
      const isMarkedToMerge = tag.classList.contains('to-merge');
      const text = tag.querySelector('.tag-content').innerText;

      if (isMarkedToMerge) {
        tag.classList.remove('to-merge');
        this.paringBuffer = this.paringBuffer.filter(
          (paringItem) => paringItem !== text
        );
      } else {
        tag.classList.add('to-merge');
        this.paringBuffer.push(text);
      }

      if (
        this.paringBuffer.length > 1 &&
        this.tags.some(
          (paring) => paring === this.createParingText(this.paringBuffer)
        )
      ) {
        this.inputField.setAttribute('placeholder', `Такий пейринг вже додано`);
      } else {
        this.inputField.setAttribute(
          'placeholder',
          `Персонажів у пейрингу: ${this.paringBuffer.length}`
        );
      }
    }
  }

  onRemoveClick(tag) {
    const text = tag.querySelector('.tag-content').innerText;

    this.tags = this.tags.filter((tagText) => tagText !== text);
    tag.remove();

    const charactersCount = this.tags.filter(
      (tagText) => !tagText.includes('/')
    ).length;

    if (charactersCount <= 1) {
      this.mergeButton.classList.add('hidden');
    }
  }

  onTagsListClick(e) {
    const elementType = this.identifyElementOnBubbling(e.target);

    const tag = this.getTag(e.target, elementType);

    if (tag) {
      e.preventDefault();
      e.stopPropagation();
    }

    switch (elementType) {
      case 'tag':
      case 'tagContent': {
        this.onTagClick(tag, this.isMergeMode, this.paringBuffer);
        break;
      }
      case 'removeButton': {
        this.onRemoveClick(tag);
        break;
      }
    }
  }

  onApplyClick() {
    if (this.paringBuffer.length) {
      const paringText = this.createParingText(this.paringBuffer);
      const isDuplicate = this.tags.some((tagText) => tagText === paringText);

      if (!isDuplicate) {
        this.tagsListElement.prepend(this.createTag(paringText, true));
        this.tags = [paringText, ...this.tags];

        this.disableMergeMode();
      }
    }
  }

  onCancelClick() {
    this.disableMergeMode();
  }

  onMergeClick() {
    if (this.tags.length > 1) {
      this.enableMergeMode();
    }
  }

  onResultClick() {
    console.log(
      this.tags.map((tagText) => {
        const tagParts = tagText.split('/');

        if (tagParts.length > 1) {
          return { text: tagText, type: 'paring' };
        } else {
          return { text: tagText, type: 'character' };
        }
      })
    );

    this.resultText.innerText = this.tags.join('; ');
  }

  getTag(element, elementType) {
    switch (elementType) {
      case 'tag':
        return element;
      case 'tagContent':
      case 'removeButton':
        return element.parentNode;
      default:
        return null;
    }
  }

  identifyElementOnBubbling(element) {
    if (element.classList.contains('tag')) {
      return 'tag';
    }

    if (element.classList.contains('tag-content')) {
      return 'tagContent';
    }

    if (element.classList.contains('remove-tag')) {
      return 'removeButton';
    }

    return null;
  }

  createParingText(parings) {
    return parings
      .sort((prev, next) => {
        if (prev.toLowerCase() < next.toLowerCase()) {
          return -1;
        }
        if (prev.toLowerCase() > next.toLowerCase()) {
          return 1;
        }
        return 0;
      })
      .join('/');
  }

  enableMergeMode() {
    this.tagsListElement.querySelectorAll('.tag').forEach((tag) => {
      tag.setAttribute('title', 'додати/прибрати з пейрингу');
      tag.querySelector('.remove-tag').classList.add('hidden');
    });

    this.tagsListElement.classList.add('merge-mode');
    this.mergeButton.classList.add('hidden');
    this.applyButton.classList.remove('hidden');
    this.cancelButton.classList.remove('hidden');
    this.inputField.setAttribute('placeholder', 'Персонажів у пейрингу: 0');
    this.inputField.setAttribute('disabled', true);
    this.isMergeMode = true;
  }

  disableMergeMode() {
    this.tagsListElement.querySelectorAll('.tag').forEach((tag) => {
      tag.classList.remove('to-merge');
      tag.querySelector('.remove-tag').classList.remove('hidden');
      tag.removeAttribute('title');
    });

    this.tagsListElement.classList.remove('merge-mode');
    this.applyButton.classList.add('hidden');
    this.cancelButton.classList.add('hidden');
    this.mergeButton.classList.remove('hidden');
    this.inputField.setAttribute('placeholder', 'Додати персонажа');
    this.inputField.removeAttribute('disabled');
    this.isMergeMode = false;
    this.paringBuffer = [];
  }

  createTag(text, isParing = false) {
    const tag = document.createElement('li');
    const closeBtn = document.createElement('button');
    const content = document.createElement('span');

    tag.classList.add('tag');

    if (isParing) {
      tag.classList.add('paring');
    }

    content.classList.add('tag-content');
    content.append(text);

    closeBtn.classList.add('remove-tag');
    closeBtn.innerText = '✖';

    tag.append(closeBtn);
    tag.append(content);

    return tag;
  }
}

new ParingsInput();
});