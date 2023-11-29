'use strict'

let habbits = []
const HABBIT_KEY = 'HABBIT_KEY'
let globalActiveHabbitId

// page
const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    h1: document.querySelector('.h1'),
    propgressPercent: document.querySelector('.progress__percent'),
    progressBarFill: document.querySelector('.progress__bar--fill'),
  },
  content: {
    contentList: document.querySelector('.content__list'),
    contentDay: document.querySelector('.content__day'),
  },
  popup: {
    cover: document.querySelector('.cover'),
    popupClose: document.querySelector('.popup__close'),
    popupOpen: document.querySelector('.menu__add'),
    sportIcon: document.querySelector('.sport'),
    waterIcon: document.querySelector('.water'),
    foodIcon: document.querySelector('.food'),
    iconField: document.querySelector('.popup-form input[name="icon"]'),
  },
}

// utils
function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY)
  const habbitArray = JSON.parse(habbitsString)
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits))
}

function togglePopup() {
  page.popup.cover.classList.toggle('cover__hidden')
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = ''
  }
}

function validateForm(form, fields) {
  const formData = new FormData(form)
  const res = {}
  for (const field of fields) {
    const fieldValue = formData.get(field)
    form[field].classList.remove('border-red-500')
    if (!fieldValue) {
      form[field].classList.add('border-red-500')
    }
    res[field] = fieldValue
  }
  let isValid = true
  for (const field of fields) {
    if (!res[field]) {
      isValid = false
    }
  }
  if (!isValid) {
    return
  }
  return res
}

// render
function rerenderMenu(activeHabbit) {
  if (!activeHabbit) {
    return
  }
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`)
    if (!existed) {
      const element = document.createElement('button')
      element.setAttribute('menu-habbit-id', habbit.id)
      element.classList.add(
        'menu__item',
        'group',
        'block',
        'w-11',
        'h-11',
        'p-2',
        'shadow-lg',
        'rounded-lg',
        'hover:bg-violet-400'
      )
      element.addEventListener('click', () => rerenderer(habbit.id))
      element.innerHTML = `<img class="group-hover:brightness-0 group-hover:invert" src="images/${habbit.icon}.svg" alt="${habbit.name}" />`
      if (activeHabbit.id === habbit.id) {
        element.classList.add('menu__item--active')
      }
      page.menu.appendChild(element)
      continue
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add('menu__item--active')
    } else {
      existed.classList.remove('menu__item--active')
    }
  }
}

function rerenderHead(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100
  page.header.propgressPercent.innerText = progress.toFixed(0) + '%'
  page.header.progressBarFill.setAttribute('style', `width: ${progress}%`)
}

function rerenderContent(activeHabbit) {
  page.content.contentList.innerHTML = ''
  for (const index in activeHabbit.days) {
    const habbitElement = document.createElement('li')
    habbitElement.classList.add(
      'content__item',
      'flex',
      'items-center',
      'bg-white',
      'rounded-xl',
      'shadow-xl'
    )
    habbitElement.innerHTML = `<div class="content__day min-w-[150px] text-center bg-indigo-50 p-5 rounded-l-xl border-r border-neutral-300 text-lg">День ${
      Number(index) + 1
    }</div>
        <div class="flex justify-between px-5 items-center flex-auto">
          <div class="comment text-lg">${activeHabbit.days[index].comment}</div>
          <button class="delete group p-2 rounded-lg hover:bg-violet-400" onclick="deleteDay(${index})" type="button">
            <img class="group-hover:brightness-0 group-hover:invert" src="./images/delete.svg" alt="Удалить день ${
              index + 1
            }" />
          </button>
        </div>`
    page.content.contentList.appendChild(habbitElement)

    page.content.contentDay.innerText = `День ${activeHabbit.days.length + 1}`
  }
}

function rerenderer(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId
  const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId)
  if (!activeHabbit) {
    return
  }
  document.location.replace(document.location.pathname + '#' + activeHabbitId)
  rerenderMenu(activeHabbit)
  rerenderHead(activeHabbit)
  rerenderContent(activeHabbit)
}

// work with days
function addDay(event) {
  event.preventDefault()
  const data = validateForm(event.target, ['comment'])
  if (!data) {
    return
  }
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      }
    }
    return habbit
  })
  resetForm(event.target, ['comment'])
  rerenderer(globalActiveHabbitId)
  saveData()
}

function deleteDay(index) {
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1)
      return {
        ...habbit,
        days: habbit.days,
      }
    }
    return habbit
  })
  rerenderer(globalActiveHabbitId)
  saveData()
}

// working with habbits
function setIcon(context, icon) {
  page.popup.iconField.value = icon
  const activeIcon = document.querySelector('.icon.icon__active')
  activeIcon.classList.remove('icon__active')
  context.classList.add('icon__active')
}

function addHabbit(event) {
  event.preventDefault()
  const data = validateForm(event.target, ['name', 'icon', 'target'])
  if (!data) {
    return
  }
  const maxId = habbits.reduce(
    (acc, habbit) => (acc > habbit ? acc : habbit.id),
    0
  )
  habbits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  })
  resetForm(event.target, ['name', 'target'])
  togglePopup()
  saveData()
  rerenderer(maxId + 1)
}

// init
;(() => {
  loadData()
  const hashId = Number(document.location.hash.replace('#', ''))
  const urlHabbit = habbits.find(habbit => habbit.id == hashId)
  if (urlHabbit) {
    rerenderer(urlHabbit.id)
  } else {
    rerenderer(habbits[0].id)
  }
})()
