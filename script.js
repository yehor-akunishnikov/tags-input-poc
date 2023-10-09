document.addEventListener('DOMContentLoaded', () => {
const tagsInput = document.querySelector('#container');
const tagsList = tagsInput.querySelector('.tags');
const inputContainer = document.querySelector('.input-container');
const mergeButton = document.querySelector('#merge-button');
const applyButton = document.querySelector('#apply-merge');
const cancelButton = document.querySelector('#cancel-merge');
const resultBtn = document.querySelector('#result');
const inputField = document.querySelector('.input-field');
const resultText = document.querySelector('#resultText');

let tags = [];
let paringBuffer = [];
let mergeMode = false;

resultBtn.addEventListener('click', () => {
  console.log(
    tags.map((tagText) => {
      const tagParts = tagText.split('/');

      if (tagParts.length > 1) {
        return { text: tagText, type: 'paring' };
      } else {
        return { text: tagText, type: 'character' };
      }
    })
  );

  resultText.innerText = tags.join('; ');
});

const createTag = (text, isParing = false) => {
  const tag = document.createElement('li');
  const closeBtn = document.createElement('span');
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
};

mergeButton.addEventListener('click', (e) => {
  if (tags.length) {
    e.target.classList.add('hidden');
    mergeMode = true;
    applyButton.classList.remove('hidden');
    cancelButton.classList.remove('hidden');
    inputField.setAttribute('disabled', true);
    tagsList.setAttribute(
      'title',
      'Обери мінімум два персонажі, щоб створити пейринг'
    );
  }
});

applyButton.addEventListener('click', (e) => {
  if (paringBuffer.length) {
    const tagsToMerge = tagsList.querySelectorAll('.to-merge');
    const paringText = paringBuffer.join('/');

    tagsList.prepend(createTag(paringText, true));
    tags = [paringText, ...tags];

    tagsToMerge.forEach((tag) => {
      tag.classList.remove('to-merge');
    });

    applyButton.classList.add('hidden');
    cancelButton.classList.add('hidden');
    mergeButton.classList.remove('hidden');
    inputField.removeAttribute('disabled');
    tagsList.setAttribute('title', '');
    mergeMode = false;
  }
});

cancelButton.addEventListener('click', () => {
  tagsList.querySelectorAll('.tag').forEach((tag) => {
    tag.classList.remove('to-merge');
    applyButton.classList.add('hidden');
    cancelButton.classList.add('hidden');
    mergeButton.classList.remove('hidden');
    inputField.removeAttribute('disabled');
    tagsList.setAttribute('title', '');
    mergeMode = false;
  });
});

tagsInput.addEventListener('click', (e) => {
  const element = e.target;

  if (
    element.classList.contains('tag') ||
    element.classList.contains('tag-content') ||
    element.classList.contains('remove-tag')
  ) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (mergeMode) {
    if (element.classList.contains('tag')) {
      if (!element.classList.contains('paring')) {
        element.classList.toggle('to-merge');
      }
    }

    if (element.classList.contains('tag-content')) {
      if (!element.parentNode.classList.contains('paring')) {
        const isMarkedToMerge =
          element.parentNode.classList.contains('to-merge');
        const text = element.parentNode.querySelector('.tag-content').innerText;

        if (isMarkedToMerge) {
          element.parentNode.classList.remove('to-merge');
          paringBuffer = paringBuffer.filter(
            (paringItem) => paringItem !== text
          );
        } else {
          element.parentNode.classList.add('to-merge');
          paringBuffer.push(text);
        }
      }
    }
  }

  if (element.classList.contains('remove-tag')) {
    if (!mergeMode) {
      const text = element.parentNode.querySelector('.tag-content').innerText;

      tags = tags.filter((tagText) => tagText !== text);

      element.parentNode.remove();
    }
  }
});

tagsInput.addEventListener('keyup', (e) => {
  const element = e.target;

  if (element.classList.contains('input-field')) {
    if (e.keyCode == 13) {
      const value = e.target.value;

      if (value) {
        tags.push(value);

        tagsList.insertBefore(createTag(value), inputContainer);

        element.value = null;
      }
    }
  }
});
});