Pod::Spec.new do |s|
  s.name           = 'VerticalBar'
  s.version        = '1.0.0'
  s.summary        = 'Refreshes the iOS 27.1 vertical bar configuration'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,swift}'
end
