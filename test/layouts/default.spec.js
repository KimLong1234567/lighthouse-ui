import Default from '@/layouts/default.vue'
import { createLocalVue, mount } from '@vue/test-utils'
import { BootstrapVue } from 'bootstrap-vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)

describe('Index', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Default, {
      localVue,
      stubs: {
        nuxt: true,
      },
    })
  })

  it('is a Vue instance', () => {
    expect(wrapper.findComponent(Default).exists()).toBeTruthy()
  })

  it('has a navbar', () => {
    expect(wrapper.findComponent({ ref: 'navbar' }).text()).toMatch(
      /Lighthouse {2}Reports Box Buster Sentinel Sample Creation Sentinel Cherrypick Imports Print Labels Beckman Cherrypick/
    )
  })
})
